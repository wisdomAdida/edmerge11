/**
 * End-to-end encryption utility for secure messaging
 * 
 * This module provides functions for encrypting and decrypting messages
 * using the Web Crypto API with AES-GCM algorithm.
 * 
 * A shared secret key is derived from a master key stored in localStorage,
 * with additional random salt for each message.
 */

// Size of the authentication tag in bytes
const AUTH_TAG_BYTES = 16;
// Length of the random IV (initialization vector) in bytes
const IV_BYTES = 12;
// Length of the salt in bytes
const SALT_BYTES = 16;
// Length of the derived key in bits
const KEY_BITS = 256;
// Master key storage key in localStorage
const MASTER_KEY_STORAGE = 'edmerge_message_master_key';

/**
 * Gets the master key from localStorage or generates a new one if not present
 */
async function getMasterKey(): Promise<CryptoKey> {
  // Check if we have the master key in localStorage
  const storedKey = localStorage.getItem(MASTER_KEY_STORAGE);
  
  if (storedKey) {
    // Import the existing key
    const keyData = new Uint8Array(JSON.parse(storedKey));
    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
  } else {
    // Generate a new random key
    const keyData = window.crypto.getRandomValues(new Uint8Array(32));
    
    // Store it in localStorage
    localStorage.setItem(MASTER_KEY_STORAGE, JSON.stringify(Array.from(keyData)));
    
    // Import it as a CryptoKey
    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
  }
}

/**
 * Derives an encryption key from the master key and a salt
 */
async function deriveKey(masterKey: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    masterKey,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a message using AES-GCM
 * Returns a base64-encoded string containing the salt, IV, and encrypted message
 */
export async function encrypt(message: string): Promise<string> {
  try {
    // Convert message to bytes
    const messageBytes = new TextEncoder().encode(message);
    
    // Generate random salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTES));
    
    // Get the master key and derive a message-specific key
    const masterKey = await getMasterKey();
    const encryptionKey = await deriveKey(masterKey, salt);
    
    // Encrypt the message
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: AUTH_TAG_BYTES * 8, // Tag length in bits
      },
      encryptionKey,
      messageBytes
    );
    
    // Combine salt + IV + ciphertext
    const result = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(ciphertext), salt.length + iv.length);
    
    // Convert to base64 for transport
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypts a message encrypted with the encrypt function
 * Takes a base64-encoded string and returns the original message
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    // Convert from base64 to bytes
    const data = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(char => char.charCodeAt(0))
    );
    
    // Extract salt, IV, and ciphertext
    const salt = data.slice(0, SALT_BYTES);
    const iv = data.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
    const ciphertext = data.slice(SALT_BYTES + IV_BYTES);
    
    // Get the master key and derive the message-specific key
    const masterKey = await getMasterKey();
    const decryptionKey = await deriveKey(masterKey, salt);
    
    // Decrypt the message
    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: AUTH_TAG_BYTES * 8, // Tag length in bits
      },
      decryptionKey,
      ciphertext
    );
    
    // Convert back to a string
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}