# Cache-Based Email Verification System

## Overview
This system stores email verification data in **Laravel Cache** instead of the database during the verification process. The database is only used after the user successfully creates their account.

## How It Works

### 1. Email Verification Request
When a user requests email verification:
- Email and verification token are stored in **cache** with a 15-minute TTL
- Cache key format: `email_verification:{email}`
- Stored data includes:
  - `email`: User's email address
  - `token`: Hashed verification token
  - `status`: 'unverified' or 'verified'
  - `created_at`: Timestamp
  - `expires_at`: Expiration timestamp

### 2. Email Verification
When user clicks the verification link:
- System retrieves verification data from cache
- Validates the token
- Updates cache with:
  - `status`: 'verified'
  - New `token`: Account creation token (64 characters)
  - Extended TTL: 1 hour
- Redirects to success page with the new token

### 3. Account Creation
When user creates their account:
- System retrieves verified email from cache using the token
- Creates user account
- Creates a `PreRegistered` record to link verification to user
- Clears the cache entry

## Benefits

✅ **Reduced Database Load**: No database writes until account is actually created
✅ **Automatic Cleanup**: Cache entries expire automatically (no manual cleanup needed)
✅ **Better Performance**: Cache is faster than database queries
✅ **Cleaner Database**: Only stores records for users who completed registration

## Cache Keys

| Key Pattern | Purpose | TTL |
|------------|---------|-----|
| `email_verification:{email}` | Store verification data | 15 min (initial), 1 hour (after verification) |
| `pre-register:{ip}:{email}` | Rate limiting for verification requests | 60 seconds |
| `resend-verification:{ip}:{email}` | Rate limiting for resend requests | 10 minutes |

## API Endpoints

### Send Verification Link
```
POST /api/pre-register/send-link
Body: { "email": "user@example.com" }
```

### Verify Email (GET - from email link)
```
GET /api/pre-register/verify?email={email}&token={token}
```

### Resend Verification Link
```
POST /api/pre-register/resend-link
Body: { "email": "user@example.com" }
```

### Get Verified Email
```
POST /api/get-verified-email
Body: { "token": "{account_token}", "email": "user@example.com" }
```

### Create Account
```
POST /api/create-account
Body: { 
  "token": "{account_token}",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

## Frontend Integration

### 1. Email Verification Success Page
After email verification, the user is redirected to:
```
http://127.0.0.1:5500/frontend/pages/email_verification_success.html?token={account_token}
```

The frontend should:
1. Extract the `token` from URL query parameters
2. Store it temporarily (e.g., in sessionStorage)
3. Use it when calling `/api/get-verified-email` and `/api/create-account`

### 2. Account Creation Flow
```javascript
// Example: Get verified email
const token = new URLSearchParams(window.location.search).get('token');
const email = sessionStorage.getItem('email'); // Store email from initial request

fetch('/api/get-verified-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, email })
})
.then(res => res.json())
.then(data => {
  // Display email and suggested username
  console.log(data.email, data.username);
});

// Create account
fetch('/api/create-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token,
    email,
    password: 'user_password',
    password_confirmation: 'user_password'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Account created:', data.user_id);
});
```

## Configuration

### Cache Driver
Make sure your `.env` file has a cache driver configured:
```env
CACHE_DRIVER=file  # or redis, memcached, etc.
```

For production, use Redis or Memcached for better performance:
```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Migration Notes

### Database Table
The `pre_registered` table is still used but only for:
- Linking verified emails to user accounts after registration
- Maintaining a record of email verifications

You can keep your existing migration, but the table will only be populated **after** account creation.

## Error Handling

| Error | Status Code | Meaning |
|-------|-------------|---------|
| Invalid or expired verification token | 403 | Token not found in cache or expired |
| Email is already registered | 409 | User already exists with this email |
| Too many verification requests | 429 | Rate limit exceeded |
| Verification token has expired | 403 | Cache entry expired (15 min for unverified, 1 hour for verified) |

## Security Features

1. **Token Hashing**: Verification tokens are hashed before storage
2. **Rate Limiting**: Prevents spam and abuse
3. **Automatic Expiration**: Cache entries expire automatically
4. **Token Rotation**: New token generated after email verification
5. **Email Validation**: Validates email format before processing
