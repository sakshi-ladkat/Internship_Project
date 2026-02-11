# Redis Cache Implementation for Draft Registration

## Overview
This document describes the implementation of a Redis-based cache mechanism for the registration draft functionality. The system allows users to save their registration progress temporarily and retrieve it later within a 30-minute window.

## Features Implemented

### 1. **Draft Save Functionality**
- **Endpoint**: `POST /api/registration/save-draft`
- **Purpose**: Save partial registration data to Redis cache
- **Expiration**: 30 minutes
- **Returns**: Unique draft token for retrieval

### 2. **Draft Retrieval**
- **Endpoint**: `POST /api/registration/get-draft`
- **Purpose**: Retrieve saved draft data using the draft token
- **Validation**: Checks for expiration and token validity

### 3. **Draft Deletion**
- **Endpoint**: `POST /api/registration/delete-draft`
- **Purpose**: Manually delete a draft from cache

### 4. **Draft Listing**
- **Endpoint**: `POST /api/registration/list-drafts`
- **Purpose**: Information endpoint about draft management

## Configuration Changes

### 1. Environment Configuration (.env)
```env
# Changed from database to redis
CACHE_STORE=redis

# Redis Configuration (already present)
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 2. Cache Configuration
The system uses the existing Redis configuration from `config/cache.php`:
- **Driver**: redis
- **Connection**: cache (uses database 1)
- **Prefix**: Automatically prefixed with app name

## API Documentation

### Save Draft
**Request:**
```http
POST /api/registration/save-draft
Content-Type: application/json

{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "institute_id": 1,
  "address_line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "continent": "North America",
  "country": "United States",
  "office_country_code": "+1",
  "office_number": "1234567890",
  "draftToken": "optional-existing-token"
}
```

**Response:**
```json
{
  "message": "Draft saved successfully",
  "draftToken": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "expiresAt": "2026-02-10T11:29:31"
}
```

### Get Draft
**Request:**
```http
POST /api/registration/get-draft
Content-Type: application/json

{
  "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

**Response:**
```json
{
  "message": "Draft retrieved successfully",
  "draft": {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "institute_id": 1,
    "address_line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "continent": "North America",
    "country": "United States",
    "office_country_code": "+1",
    "office_number": "1234567890",
    "saved_at": "2026-02-10T10:59:31",
    "expires_at": "2026-02-10T11:29:31"
  },
  "expiresAt": "2026-02-10T11:29:31"
}
```

### Delete Draft
**Request:**
```http
POST /api/registration/delete-draft
Content-Type: application/json

{
  "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

**Response:**
```json
{
  "message": "Draft deleted successfully"
}
```

## Redis Setup Instructions

### 1. Install Redis (if not already installed)

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Windows:
Download and install from: https://github.com/microsoftarchive/redis/releases

### 2. Verify Redis Installation
```bash
redis-cli ping
# Should return: PONG
```

### 3. Install PHP Redis Extension

#### Ubuntu/Debian:
```bash
sudo apt install php-redis
sudo systemctl restart php8.1-fpm  # or your PHP version
```

#### macOS:
```bash
pecl install redis
```

#### Verify Installation:
```bash
php -m | grep redis
# Should show: redis
```

### 4. Test Redis Connection
```bash
# Connect to Redis CLI
redis-cli

# Test basic commands
127.0.0.1:6379> SET test "Hello Redis"
127.0.0.1:6379> GET test
127.0.0.1:6379> DEL test
127.0.0.1:6379> EXIT
```

## Cache Key Structure

The system uses the following cache key pattern:
```
{app_name}-cache-register_draft_{uuid}
```

Example:
```
internship-project-demo-cache-register_draft_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
```

## Security Features

### 1. **Data Sanitization**
- Passwords and sensitive fields are excluded from draft storage
- Only registration form data is cached

### 2. **Expiration**
- Automatic expiration after 30 minutes
- Prevents stale data accumulation

### 3. **Token-Based Access**
- UUID tokens ensure unpredictable access
- No email-based listing to prevent enumeration

### 4. **Logging**
- All draft operations are logged for audit purposes
- Includes IP address and timestamp

## Frontend Integration Example

### JavaScript Implementation
```javascript
// Save draft
async function saveDraft(formData) {
  const response = await fetch('/api/registration/save-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  
  // Store token in localStorage
  localStorage.setItem('registrationDraftToken', data.draftToken);
  
  return data;
}

// Retrieve draft
async function loadDraft() {
  const token = localStorage.getItem('registrationDraftToken');
  
  if (!token) {
    return null;
  }
  
  const response = await fetch('/api/registration/get-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  if (response.status === 404 || response.status === 410) {
    // Draft expired or not found
    localStorage.removeItem('registrationDraftToken');
    return null;
  }
  
  const data = await response.json();
  return data.draft;
}

// Delete draft
async function deleteDraft() {
  const token = localStorage.getItem('registrationDraftToken');
  
  if (!token) {
    return;
  }
  
  await fetch('/api/registration/delete-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  
  localStorage.removeItem('registrationDraftToken');
}

// Auto-save on form change (debounced)
let saveTimeout;
function autoSaveDraft(formData) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDraft(formData);
  }, 2000); // Save 2 seconds after user stops typing
}
```

## Monitoring and Debugging

### View All Cache Keys
```bash
redis-cli KEYS "internship-project-demo-cache-register_draft_*"
```

### View Specific Draft
```bash
redis-cli GET "internship-project-demo-cache-register_draft_{uuid}"
```

### Check TTL (Time To Live)
```bash
redis-cli TTL "internship-project-demo-cache-register_draft_{uuid}"
```

### Clear All Drafts
```bash
redis-cli KEYS "internship-project-demo-cache-register_draft_*" | xargs redis-cli DEL
```

### Monitor Redis Operations
```bash
redis-cli MONITOR
```

## Performance Benefits

### Redis vs Database Cache

| Feature | Redis | Database |
|---------|-------|----------|
| Speed | In-memory (microseconds) | Disk-based (milliseconds) |
| Scalability | Horizontal scaling | Vertical scaling |
| TTL Support | Native | Requires cleanup jobs |
| Concurrency | High | Moderate |
| Memory Usage | Higher | Lower |

### Expected Performance
- **Write Operations**: < 1ms
- **Read Operations**: < 1ms
- **Concurrent Users**: 10,000+
- **Draft Storage**: ~1KB per draft

## Troubleshooting

### Issue: "Connection refused" Error
**Solution:**
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start Redis if not running
sudo systemctl start redis-server
```

### Issue: PHP Redis Extension Not Found
**Solution:**
```bash
# Install PHP Redis extension
sudo apt install php-redis

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

### Issue: Cache Not Working
**Solution:**
```bash
# Clear Laravel cache
php artisan cache:clear
php artisan config:clear

# Test Redis connection
php artisan tinker
>>> Cache::store('redis')->put('test', 'value', 60);
>>> Cache::store('redis')->get('test');
```

### Issue: Permission Denied
**Solution:**
```bash
# Check Redis socket permissions
sudo chmod 777 /var/run/redis/redis.sock

# Or use TCP connection instead (already configured)
```

## Migration from Database Cache

If you were previously using database cache, no migration is needed. The system will automatically start using Redis. Old database cache entries will expire naturally.

To manually clear old database cache:
```bash
php artisan cache:clear
```

## Best Practices

1. **Auto-save Frequency**: Implement debouncing (2-3 seconds) to avoid excessive cache writes
2. **Token Storage**: Store draft tokens in localStorage, not sessionStorage
3. **Error Handling**: Always handle 404/410 responses (expired drafts)
4. **User Feedback**: Show save status and expiration time to users
5. **Cleanup**: Delete drafts after successful registration
6. **Testing**: Test with Redis unavailable to ensure graceful degradation

## Future Enhancements

1. **Extended Expiration**: Allow users to extend draft expiration
2. **Multiple Drafts**: Support multiple drafts per user
3. **Draft Versioning**: Keep draft history for recovery
4. **Encryption**: Encrypt sensitive draft data
5. **Compression**: Compress large draft payloads
6. **Analytics**: Track draft save/load patterns

## Conclusion

The Redis cache implementation provides a fast, scalable solution for draft registration data. It improves user experience by allowing them to save progress and return later, while maintaining security and performance.
