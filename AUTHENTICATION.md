# Enhanced Authentication API

This document describes the enhanced authentication features implemented in the User Service.

## Overview

The authentication system now uses JWT access tokens with refresh token support, providing better security through short-lived access tokens and secure refresh mechanism.

## Authentication Flow

1. **Login**: User provides credentials and receives an access token + refresh token (stored as httpOnly cookie)
2. **Access**: Use access token in Authorization header for API calls
3. **Refresh**: When access token expires, use refresh endpoint to get a new access token
4. **Logout**: Clear refresh token from database and cookie

## API Endpoints

### 1. POST /api/auth/login
Authenticates a user and provides access token with refresh token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clm...",
    "email": "user@example.com",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Cookie Set:**
```
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

### 2. POST /api/auth/refresh
Issues a new access token using the refresh token stored in cookies.

**Request:** No body required (uses cookie)

**Request Cookie:** 
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. POST /api/auth/logout
Invalidates the user's session by clearing the refresh token.

**Authorization:** Bearer Token (JWT access token required)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (204 No Content):** Empty response body

**Cookie Cleared:**
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0
```

## Token Details

### Access Token
- **Lifetime:** 15 minutes
- **Usage:** Include in Authorization header for API requests
- **Format:** `Authorization: Bearer <access_token>`
- **Contains:** userId, email, role

### Refresh Token
- **Lifetime:** 7 days
- **Storage:** HttpOnly cookie (secure, cannot be accessed by JavaScript)
- **Path:** `/api/auth/refresh` (only sent to refresh endpoint)
- **Database:** Stored in user table with expiry date

## Security Features

1. **Short-lived Access Tokens:** 15-minute expiry reduces exposure window
2. **HttpOnly Cookies:** Refresh tokens stored securely, immune to XSS attacks
3. **Secure Cookies:** HTTPS-only in production
4. **SameSite Strict:** CSRF protection
5. **Path Restriction:** Refresh token only sent to refresh endpoint
6. **Database Validation:** Refresh tokens validated against database
7. **Token Rotation:** Each login generates new refresh token

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=production  # For secure cookies in production
```

## Usage Examples

### Frontend Login Flow
```javascript
// 1. Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({ email, password })
});

const { accessToken, user } = await response.json();

// 2. Store access token (localStorage/memory)
localStorage.setItem('accessToken', accessToken);

// 3. Use access token for API calls
const apiResponse = await fetch('/api/user/profile', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});
```

### Auto-Refresh Implementation
```javascript
// Automatic token refresh function
async function refreshAccessToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Send refresh token cookie
    });
    
    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    window.location.href = '/login';
  }
}

// API request with auto-refresh
async function apiRequest(url, options = {}) {
  let token = localStorage.getItem('accessToken');
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  
  // If token expired, try to refresh
  if (response.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    }
  }
  
  return response;
}
```

### Logout
```javascript
async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
    },
    credentials: 'include'
  });
  
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}
```

## Database Changes

The following fields were added to all user tables (Student, Teacher, Admin):

```sql
-- New columns added
refreshToken         VARCHAR(255) UNIQUE,
refreshTokenExpires  TIMESTAMP;
```

## Migration

To apply the database changes:

```bash
npx prisma migrate dev --name add_refresh_token_support
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid credentials." // Login failed
}
```

```json
{
  "message": "Refresh token not provided." // No refresh token cookie
}
```

```json
{
  "message": "Invalid or expired refresh token." // Bad refresh token
}
```

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Please include a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Testing the Implementation

Use tools like Postman or curl to test:

```bash
# 1. Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# 2. Use access token for protected route
curl -X GET http://localhost:4001/api/auth/profile \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt

# 3. Refresh token
curl -X POST http://localhost:4001/api/auth/refresh \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:4001/api/auth/logout \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt
```
