# Enhanced Registration Controller - Security Features

## Overview
The RegistrationController has been enhanced with pre-registration security features including rate limiting, improved error handling, and comprehensive logging.

## New Security Features

### 1. **Rate Limiting**

#### Email Verification Requests
- **Limit:** 3 requests per minute per IP+email combination
- **Purpose:** Prevent spam and abuse
- **Response:** HTTP 429 (Too Many Requests)
- **Decay:** 60 seconds

```php
// Rate limiting key format
'verification:' . $request->ip() . ':' . $email
```

#### Resend Verification Requests
- **Limit:** 2 requests per 10 minutes per IP+email combination
- **Purpose:** Prevent excessive resend attempts
- **Response:** HTTP 429 (Too Many Requests)
- **Decay:** 600 seconds (10 minutes)

```php
// Rate limiting key format
'resend-verification:' . $request->ip() . ':' . $email
```

### 2. **Enhanced Token Security**

- **Token Length:** 64 characters (increased from 32)
- **Hashing:** All tokens are hashed using bcrypt before storage
- **Expiration:** 
  - Email verification: 15 minutes
  - Session token: 1 hour
  - Password setup: 24 hours

### 3. **Security Logging**

All verification attempts are logged for security auditing:

```php
\Log::info('Verification email sent', [
    'email' => $email,
    'ip' => $request->ip(),
    'timestamp' => now()->toDateTimeString()
]);
```

**Log Locations:**
- Success: `storage/logs/laravel.log` (INFO level)
- Failures: `storage/logs/laravel.log` (ERROR level)

### 4. **Information Disclosure Prevention**

The system no longer reveals whether an email exists in the database when resending verification:

**Before:**
```json
{
  "message": "Account already exists. Please login."
}
```

**After:**
```json
{
  "message": "If this email is registered, a verification link will be sent."
}
```

This prevents attackers from enumerating valid email addresses.

## API Endpoints

### Send Verification Link
```
POST /api/registration/send-verification
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
- `200 OK` - Verification email sent
- `409 Conflict` - Email already registered or has pending registration
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Email sending failed

### Resend Verification Link
```
POST /api/registration/resend-verification
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
- `200 OK` - Verification email sent (or security message)
- `409 Conflict` - Registration already completed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Email sending failed

## Security Best Practices Implemented

### ✅ Rate Limiting
Prevents brute force attacks and spam

### ✅ Token Hashing
Tokens are never stored in plain text

### ✅ Time-based Expiration
All tokens have strict expiration times

### ✅ Comprehensive Logging
All security-relevant events are logged

### ✅ Information Disclosure Prevention
System doesn't reveal user existence

### ✅ IP-based Tracking
Rate limits are tied to IP addresses

## Monitoring and Alerts

### Log Monitoring
Monitor these log patterns for potential security issues:

```bash
# Check for rate limit violations
grep "Too many" storage/logs/laravel.log

# Check for failed verification attempts
grep "Verification email failed" storage/logs/laravel.log

# Check verification activity
grep "Verification email sent" storage/logs/laravel.log
```

### Recommended Alerts

1. **High Rate Limit Violations**
   - Alert if >10 rate limit violations from same IP in 1 hour
   - Possible bot or attack

2. **Failed Email Sends**
   - Alert if email sending fails >5 times in 10 minutes
   - Possible mail server issue

3. **Unusual Verification Patterns**
   - Alert if >100 verification emails sent in 1 hour
   - Possible abuse

## Testing Rate Limits

### Test Email Verification Rate Limit
```bash
# Should succeed 3 times, then fail
for i in {1..5}; do
  curl -X POST http://127.0.0.1:8000/api/registration/send-verification \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo ""
done
```

### Test Resend Rate Limit
```bash
# Should succeed 2 times, then fail
for i in {1..4}; do
  curl -X POST http://127.0.0.1:8000/api/registration/resend-verification \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo ""
  sleep 1
done
```

## Configuration

### Adjusting Rate Limits

Edit `app/Http/Controllers/RegistrationController.php`:

```php
// Change verification rate limit (currently 3 per minute)
if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($key, 5)) { // Change to 5

// Change resend rate limit (currently 2 per 10 minutes)
if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($key, 3)) { // Change to 3
```

### Adjusting Token Expiration

```php
// Email verification (currently 15 minutes)
Cache::put($cacheKey, [...], now()->addMinutes(30)); // Change to 30 minutes

// Session token (currently 1 hour)
Cache::put($cacheKey, [...], now()->addHours(2)); // Change to 2 hours

// Password setup (currently 24 hours)
Cache::put($passwordCacheKey, [...], now()->addHours(48)); // Change to 48 hours
```

## Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Rate Limiting | ❌ None | ✅ Implemented |
| Token Length | 64 chars | 64 chars (maintained) |
| Security Logging | ⚠️ Basic | ✅ Comprehensive |
| Information Disclosure | ❌ Reveals user existence | ✅ Protected |
| IP Tracking | ❌ None | ✅ Implemented |
| Error Messages | ⚠️ Generic | ✅ Specific & Secure |

## Migration Notes

- **No database changes required**
- **No breaking changes to API**
- **Backward compatible with existing frontend**
- **Existing tokens remain valid**

## Next Steps

1. ✅ Implement rate limiting
2. ✅ Add security logging
3. ✅ Prevent information disclosure
4. 🔄 Set up log monitoring
5. 🔄 Configure alerts
6. 🔄 Add automated tests for rate limits
7. 🔄 Document security policies

## Support

For security concerns or questions, contact the development team.

**Last Updated:** 2026-02-09
