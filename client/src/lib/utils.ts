import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random library access ID
 * @returns A string in the format EDLIB-XXXXX-XXXXX
 */
export function generateLibraryAccessId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const firstPart = Array(5).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  const secondPart = Array(5).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `EDLIB-${firstPart}-${secondPart}`;
}

// Exchange rate - approximate, ideally would use a real-time API
const USD_TO_NGN_RATE = 1500; 

/**
 * Converts USD to NGN
 * @param usdAmount Amount in USD
 * @returns Amount in NGN (Nigerian Naira)
 */
export function convertUSDtoNGN(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_NGN_RATE);
}

/**
 * Converts NGN to USD
 * @param ngnAmount Amount in NGN (Nigerian Naira)
 * @returns Amount in USD
 */
export function convertNGNtoUSD(ngnAmount: number): number {
  return parseFloat((ngnAmount / USD_TO_NGN_RATE).toFixed(2));
}

/**
 * Format currency based on the currency code
 * @param amount The amount to format
 * @param currencyCode The currency code (NGN, USD, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'NGN'): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'NGN' ? 0 : 2
  });
  
  return formatter.format(amount);
}

// Supported countries (currently only Nigeria)
const SUPPORTED_COUNTRIES = ['NG'];

/**
 * Check if the user's country is supported by the platform
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Boolean indicating if the country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return SUPPORTED_COUNTRIES.includes(countryCode);
}

/**
 * Gets the user's country and currency information
 * Returns country code, currency code, and whether the country is supported
 */
export async function getUserLocationInfo(): Promise<{
  countryCode: string;
  currencyCode: string;
  isSupported: boolean;
}> {
  try {
    // Using a free geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const countryCode = data.country_code || 'NG'; // Default to Nigeria if detection fails
    const currencyCode = data.currency || 'NGN';
    const isSupported = isCountrySupported(countryCode);
    
    return {
      countryCode,
      currencyCode,
      isSupported
    };
  } catch (error) {
    console.error('Failed to detect user location:', error);
    // Default to Nigeria if there's an error
    return {
      countryCode: 'NG',
      currencyCode: 'NGN',
      isSupported: true
    };
  }
}
