// Test script for updating user settings
import fetch from 'node-fetch';

async function loginAndUpdateSettings() {
  // 1. Login with existing credentials (using a student account)
  const loginResponse = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: 'aspro2', 
      password: '53611f4bc13e0e02134b28a4952ca5c76fbbb1a967c344fe2e08b5755168ff9a7001cfb370867fa0d42d2c28c5f923bc3a6f929431c12f26e968f77c3802d2fe.b83041fe737c983fc78edbef7a1cb568' 
    }),
    credentials: 'include'
  });

  if (!loginResponse.ok) {
    console.error('Login failed:', loginResponse.status, await loginResponse.text());
    return;
  }

  const user = await loginResponse.json();
  console.log('Logged in as:', user);

  // 2. Store cookies from login response
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  // Get all users since we're logged in as admin
  const usersResponse = await fetch('http://localhost:5000/api/users', {
    headers: { 'Cookie': cookies },
    credentials: 'include'
  });
  
  if (usersResponse.ok) {
    const users = await usersResponse.json();
    console.log('Available users:', users);
  } else {
    console.error('Failed to get users:', usersResponse.status, await usersResponse.text());
  }

  // 3. Now update settings using the same cookie
  const settingsResponse = await fetch('http://localhost:5000/api/user/settings', {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      firstName: 'Primary',
      lastName: 'Student',
      email: 'charlizetheroncharlize520@gmail.com',
      studentLevel: 'primary',
      bio: 'I am a primary school student excited to learn with EdMerge platform!',
      profileImage: 'https://example.com/student_profile.jpg',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      preferences: {
        darkMode: false,
        language: 'english',
        accessibility: {
          screenReader: false,
          highContrast: false,
          largeText: true
        }
      }
    }),
    credentials: 'include'
  });

  if (!settingsResponse.ok) {
    console.error('Settings update failed:', settingsResponse.status, await settingsResponse.text());
    return;
  }

  const result = await settingsResponse.json();
  console.log('Settings updated successfully:', result);
}

loginAndUpdateSettings().catch(console.error);