# Draft System Troubleshooting Guide

## Quick Diagnosis

### Step 1: Open Test Page
Navigate to: `http://127.0.0.1:5502/frontend/test-draft.html`

This page will help you test each component of the draft system.

### Step 2: Run Tests in Order

1. **Check Configuration** - Verify API URL is correct
2. **Test Save Draft** - Fill in test data and save
3. **Test Load Draft** - Verify data can be retrieved
4. **Check LocalStorage** - Confirm token is stored
5. **Test Redis** - Verify Redis connection works

## Common Issues and Solutions

### Issue 1: "Draft not restoring data"

**Symptoms:**
- Form fields remain empty after email verification
- No "Your previous progress has been restored" message

**Diagnosis:**
```javascript
// Open browser console (F12) and check:
1. localStorage.getItem('registrationDraftToken')
   - Should return a UUID string
   - If null, draft was never saved

2. Look for console logs:
   - "loadDraft called, token: ..."
   - "Draft loaded successfully: ..."
   - "Populating form from draft: ..."
```

**Solutions:**

**A. No token in localStorage**
```javascript
// The draft was never saved. Check:
1. Open registration page
2. Fill Step 1 (Institute)
3. Wait 2 seconds
4. Check console for "Draft saved: {token}"
5. Check localStorage.getItem('registrationDraftToken')
```

**B. Token exists but draft not loading**
```javascript
// Check API response:
1. Open Network tab in DevTools
2. Reload registration page
3. Look for POST request to /api/registration/get-draft
4. Check response:
   - 200 OK = draft found
   - 404 = draft expired or not found
   - 500 = server error
```

**C. Draft loads but fields not populating**
```javascript
// Check console logs:
console.log('Populating form from draft:', draft);
console.log('Total fields populated: X');

// If "Total fields populated: 0", the form elements don't exist yet
// Solution: Increase delay in registration-view.js
setTimeout(async () => {
    await loadDraft();
}, 1000); // Increase from 500ms to 1000ms
```

### Issue 2: "Auto-save not working"

**Symptoms:**
- No "✓ Draft saved" indicator appears
- No draft token in localStorage

**Diagnosis:**
```javascript
// Check if setupAutoSave was called:
console.log(typeof window.setupAutoSave); // Should be 'function'

// Manually trigger save:
window.saveDraft();
```

**Solutions:**

**A. setupAutoSave not called**
```javascript
// Check registration-view.js multiStepRegisterMount()
// Ensure it calls setupAutoSave()
if (typeof setupAutoSave === 'function') {
    setupAutoSave();
}
```

**B. Event listeners not attached**
```javascript
// Check if form exists:
document.getElementById('registrationForm'); // Should not be null

// If null, form hasn't loaded yet
// Solution: Add delay before setupAutoSave
setTimeout(() => {
    if (typeof setupAutoSave === 'function') {
        setupAutoSave();
    }
}, 300);
```

### Issue 3: "Draft expires too quickly"

**Symptoms:**
- Draft works initially but disappears after some time
- 404 error when loading draft

**Solution:**
Increase expiration time in `RegistrationController.php`:
```php
// Change from 30 minutes to 24 hours
Cache::put($cacheKey, $draftData, now()->addHours(24));
```

### Issue 4: "Redis not running"

**Symptoms:**
- 500 error when saving draft
- "Connection refused" in Laravel logs

**Diagnosis:**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running:
sudo systemctl status redis
```

**Solution:**
```bash
# Start Redis
sudo systemctl start redis

# Enable on boot
sudo systemctl enable redis

# Or install Redis if not installed
sudo bash setup_redis.sh
```

### Issue 5: "CORS errors"

**Symptoms:**
- Network errors in console
- "Access-Control-Allow-Origin" errors

**Solution:**
Check `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'], // Or specific frontend URL
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## Debugging Commands

### Browser Console

```javascript
// Check if functions are available
typeof window.loadDraft;        // 'function'
typeof window.saveDraft;        // 'function'
typeof window.setupAutoSave;    // 'function'

// Check localStorage
localStorage.getItem('registrationDraftToken');

// Manually save draft
window.saveDraft();

// Manually load draft
window.loadDraft();

// Check current step
registrationCurrentStep;

// Check verification token
verificationToken;
verifiedEmail;
```

### Redis CLI

```bash
# Connect to Redis
redis-cli

# List all draft keys
KEYS "internship-project-demo-cache-register_draft_*"

# View specific draft
GET "internship-project-demo-cache-register_draft_{YOUR_TOKEN}"

# Check TTL (time to live)
TTL "internship-project-demo-cache-register_draft_{YOUR_TOKEN}"

# Delete specific draft
DEL "internship-project-demo-cache-register_draft_{YOUR_TOKEN}"

# Delete all drafts (CAREFUL!)
EVAL "return redis.call('del', unpack(redis.call('keys', 'internship-project-demo-cache-register_draft_*')))" 0
```

### Laravel Logs

```bash
# View real-time logs
tail -f storage/logs/laravel.log

# Search for draft-related errors
grep -i "draft" storage/logs/laravel.log

# Search for cache errors
grep -i "cache" storage/logs/laravel.log
```

## Testing Workflow

### Complete Test Scenario

1. **Clear everything:**
   ```javascript
   localStorage.clear();
   ```
   ```bash
   redis-cli FLUSHDB
   ```

2. **Open registration page:**
   - Navigate to `http://127.0.0.1:5502/frontend/index.html#/multi-step-register`

3. **Fill Step 1:**
   - Select an institute
   - Wait 2 seconds
   - **Expected:** Console shows "Draft saved: {token}"
   - **Expected:** Green "✓ Draft saved" indicator appears

4. **Fill Step 2:**
   - Enter first name, last name
   - Wait 2 seconds
   - **Expected:** Console shows "Draft saved: {same-token}"

5. **Go to Step 3:**
   - Click "Next"
   - **Expected:** Email verification step appears

6. **Verify localStorage:**
   ```javascript
   localStorage.getItem('registrationDraftToken')
   // Should return UUID
   ```

7. **Simulate email verification:**
   - Option A: Actually send email and click link
   - Option B: Manually navigate with token:
     ```
     http://127.0.0.1:5502/frontend/index.html#/multi-step-register?token=YOUR_TOKEN&email=test@example.com
     ```

8. **Check restoration:**
   - **Expected:** Console shows:
     - "loadDraft called, token: ..."
     - "Draft loaded successfully: ..."
     - "Populating form from draft: ..."
     - "Total fields populated: X"
   - **Expected:** Toast notification: "Your previous progress has been restored"
   - **Expected:** Form fields contain saved data

## Network Inspection

### Save Draft Request

**Expected Request:**
```
POST http://127.0.0.1:8000/api/registration/save-draft
Content-Type: application/json

{
  "institute_id": "1",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "currentStep": 2
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Draft saved successfully",
  "draftToken": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "expiresAt": "2026-02-10T12:27:14"
}
```

### Load Draft Request

**Expected Request:**
```
POST http://127.0.0.1:8000/api/registration/get-draft
Content-Type: application/json

{
  "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Draft retrieved successfully",
  "draft": {
    "institute_id": "1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "currentStep": 2,
    "saved_at": "2026-02-10T11:57:14",
    "expires_at": "2026-02-10T12:27:14"
  },
  "expiresAt": "2026-02-10T12:27:14"
}
```

## Still Having Issues?

### Collect Debug Information

1. **Browser Console Output:**
   - Copy all console logs
   - Include any errors (red text)

2. **Network Tab:**
   - Screenshot of /save-draft request/response
   - Screenshot of /get-draft request/response

3. **LocalStorage:**
   ```javascript
   console.log(localStorage.getItem('registrationDraftToken'));
   ```

4. **Redis Data:**
   ```bash
   redis-cli KEYS "*draft*"
   redis-cli GET "internship-project-demo-cache-register_draft_{TOKEN}"
   ```

5. **Laravel Logs:**
   ```bash
   tail -n 50 storage/logs/laravel.log
   ```

### Manual Override

If auto-save isn't working, you can manually save and load:

```javascript
// Manually save current form data
await window.saveDraft();

// Check if it saved
console.log(localStorage.getItem('registrationDraftToken'));

// Manually load draft
await window.loadDraft();
```

## Contact Points

- Check `REGISTRATION_DRAFT_SYSTEM.md` for technical details
- Check `DRAFT_API_QUICKSTART.md` for API examples
- Use `test-draft.html` for isolated testing

---

**Last Updated:** February 10, 2026
