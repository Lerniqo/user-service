#!/usr/bin/env node

/**
 * Test script for authentication endpoints
 * Run with: node test-auth.js
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:4001';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Extract cookies from response headers
function extractCookies(headers) {
  const cookies = headers['set-cookie'];
  if (!cookies) return {};
  
  const cookieObj = {};
  cookies.forEach(cookie => {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    cookieObj[name] = value;
  });
  return cookieObj;
}

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints\n');

  // Test user credentials (replace with actual test user)
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    // 1. Test Login
    console.log('1. Testing Login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 4001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testUser);

    console.log(`Status: ${loginResponse.statusCode}`);
    if (loginResponse.statusCode === 200) {
      console.log('✅ Login successful');
      console.log(`Access Token: ${loginResponse.body.accessToken?.substring(0, 50)}...`);
      
      const cookies = extractCookies(loginResponse.headers);
      const refreshToken = cookies.refreshToken;
      console.log(`Refresh Token Cookie: ${refreshToken ? 'Set' : 'Not Set'}`);
      
      if (refreshToken) {
        // 2. Test Refresh Token
        console.log('\n2. Testing Token Refresh...');
        const refreshResponse = await makeRequest({
          hostname: 'localhost',
          port: 4001,
          path: '/api/auth/refresh',
          method: 'POST',
          headers: {
            'Cookie': `refreshToken=${refreshToken}`
          }
        });

        console.log(`Status: ${refreshResponse.statusCode}`);
        if (refreshResponse.statusCode === 200) {
          console.log('✅ Token refresh successful');
          console.log(`New Access Token: ${refreshResponse.body.accessToken?.substring(0, 50)}...`);
        } else {
          console.log('❌ Token refresh failed');
          console.log(refreshResponse.body);
        }

        // 3. Test Protected Route
        console.log('\n3. Testing Protected Route...');
        const profileResponse = await makeRequest({
          hostname: 'localhost',
          port: 4001,
          path: '/api/auth/profile',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResponse.body.accessToken}`,
            'Cookie': `refreshToken=${refreshToken}`
          }
        });

        console.log(`Status: ${profileResponse.statusCode}`);
        if (profileResponse.statusCode === 200) {
          console.log('✅ Protected route access successful');
          console.log(`User: ${profileResponse.body.firstName} ${profileResponse.body.lastName}`);
        } else {
          console.log('❌ Protected route access failed');
          console.log(profileResponse.body);
        }

        // 4. Test Logout
        console.log('\n4. Testing Logout...');
        const logoutResponse = await makeRequest({
          hostname: 'localhost',
          port: 4001,
          path: '/api/auth/logout',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${loginResponse.body.accessToken}`,
            'Cookie': `refreshToken=${refreshToken}`
          }
        });

        console.log(`Status: ${logoutResponse.statusCode}`);
        if (logoutResponse.statusCode === 204) {
          console.log('✅ Logout successful');
          
          // Check if refresh token is invalidated
          console.log('\n5. Testing Refresh After Logout...');
          const postLogoutRefresh = await makeRequest({
            hostname: 'localhost',
            port: 4001,
            path: '/api/auth/refresh',
            method: 'POST',
            headers: {
              'Cookie': `refreshToken=${refreshToken}`
            }
          });

          if (postLogoutRefresh.statusCode === 401) {
            console.log('✅ Refresh token properly invalidated after logout');
          } else {
            console.log('❌ Refresh token not properly invalidated');
          }
        } else {
          console.log('❌ Logout failed');
          console.log(logoutResponse.body);
        }
      }
    } else {
      console.log('❌ Login failed');
      console.log(loginResponse.body);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }

  console.log('\n🏁 Authentication tests completed');
}

// Run tests
testAuth();
