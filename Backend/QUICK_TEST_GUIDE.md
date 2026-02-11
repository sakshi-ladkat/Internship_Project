# 🔧 Quick Fix & Test Guide

## What I Fixed

1. ✅ **Removed conflicting DOMContentLoaded listener** - Was preventing SPA router initialization
2. ✅ **Fixed setupAutoSave form selector** - Now finds `registrationFormWrapper` correctly
3. ✅ **Added comprehensive logging** - Easy to debug in browser console
4. ✅ **Exposed setupAutoSave to window** - Can be called manually if needed

## Test Now!

### 1. Clear Everything (Fresh Start)
Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

### 2. Test Auto-Save

**Steps:**
1. Navigate to registration page: `http://127.0.0.1:5502/frontend/index.html#/multi-step-register`
2. Open browser console (F12)
3. Select an institute from dropdown
4. **Watch console for:**
   ```
   setupAutoSave called
   Form found, attaching event listeners
   Found X input/select elements
   Auto-save listeners attached successfully
   ```
5. Wait 2 seconds after selecting
6. **Watch for:**
   ```
   Draft saved: {uuid-token}
   ```
7. **Look for green notification** in top-right: "✓ Draft saved"

### 3. Test Draft Restoration

**Steps:**
1. Fill Step 1 (Institute) - wait 2 seconds
2. Fill Step 2 (Name fields) - wait 2 seconds
3. Check localStorage:
   ```javascript
   localStorage.getItem('registrationDraftToken')
   // Should show UUID
   ```
4. **Refresh the page** (F5)
5. **Watch console for:**
   ```
   loadDraft called, token: {uuid}
   Fetching draft from API...
   Draft API response status: 200
   Draft loaded successfully: {...}
   Populating form from draft: {...}
   Total fields populated: X
   ```
6. **Check form** - should have your data!

### 4. Test Email Verification Flow

**Steps:**
1. Fill Steps 1 & 2 (wait for auto-save)
2. Go to Step 3
3. Enter email and send verification
4. Click email link (or simulate with URL params)
5. **Watch console** - should see draft loading
6. **Check form** - Steps 1 & 2 data should be there!

## Console Commands for Testing

```javascript
// Check if everything is loaded
typeof window.setupAutoSave;     // 'function'
typeof window.loadDraft;         // 'function'
typeof window.saveDraft;         // 'function'

// Check token
localStorage.getItem('registrationDraftToken');

// Manually trigger auto-save setup
window.setupAutoSave();

// Manually save current form
await window.saveDraft();

// Manually load draft
await window.loadDraft();

// Check form wrapper exists
document.getElementById('registrationFormWrapper');

// Count form inputs
document.querySelectorAll('#registrationFormWrapper input, #registrationFormWrapper select').length;
```

## Expected Console Output (Success)

```
Registration page loaded
setupAutoSave called
Form found, attaching event listeners
Found 18 input/select elements
Auto-save listeners attached successfully
loadDraft called, token: null
No draft token found in localStorage

[User fills institute field]

[After 2 seconds]
Draft saved: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d

[User fills name fields]

[After 2 seconds]
Draft saved: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d

[User refreshes page]

setupAutoSave called
Form found, attaching event listeners
Found 18 input/select elements
Auto-save listeners attached successfully
loadDraft called, token: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Fetching draft from API...
Draft API response status: 200
Draft API response data: {message: "Draft retrieved successfully", draft: {...}}
Draft loaded successfully: {institute_id: "1", first_name: "John", ...}
Populating form from draft: {institute_id: "1", first_name: "John", ...}
Populated institute with value: 1
Populated firstName with value: John
Populated lastName with value: Doe
Total fields populated: 3
```

## If Still Not Working

### Use Test Page
Navigate to: `http://127.0.0.1:5502/frontend/test-draft.html`

This isolated test page will help identify the exact issue:
1. Click "Check Config" - verify API URL
2. Click "Test Save Draft" - test saving
3. Click "Test Load Draft" - test loading
4. Click "Check LocalStorage" - verify token storage
5. Click "Test Redis" - verify Redis connection

### Check These Files

1. **Browser Console** - Look for errors (red text)
2. **Network Tab** - Check API requests/responses
3. **Laravel Logs** - `tail -f storage/logs/laravel.log`
4. **Redis** - `redis-cli KEYS "*draft*"`

### Manual Override

If auto-save still doesn't work, you can manually save:

```javascript
// After filling form, manually save
await window.saveDraft();

// Verify it saved
console.log(localStorage.getItem('registrationDraftToken'));

// Later, manually load
await window.loadDraft();
```

## Common Issues

### "setupAutoSave called" but no "Form found"
**Problem:** Form hasn't loaded yet  
**Solution:** Increase delay in registration-view.js line ~253:
```javascript
setTimeout(() => {
    if (typeof setupAutoSave === 'function') {
        setupAutoSave();
    }
}, 800); // Increase from 500ms
```

### "Found 0 input/select elements"
**Problem:** Form structure issue  
**Solution:** Check HTML - ensure inputs are inside `registrationFormWrapper`

### "Draft saved" but "No draft token found" on reload
**Problem:** localStorage not persisting  
**Solution:** Check browser privacy settings, try different browser

### API returns 404 when loading draft
**Problem:** Draft expired or Redis cleared  
**Solution:** Draft only lasts 30 minutes, save again

## Success Indicators

✅ Console shows "Auto-save listeners attached successfully"  
✅ Green "✓ Draft saved" appears after typing  
✅ Token exists in localStorage  
✅ Data restores after page refresh  
✅ Data restores after email verification  
✅ Toast shows "Your previous progress has been restored"  

## Need More Help?

1. Read `DRAFT_TROUBLESHOOTING.md` - Comprehensive troubleshooting
2. Read `REGISTRATION_DRAFT_SYSTEM.md` - Technical documentation
3. Use `test-draft.html` - Isolated testing environment

---

**Last Updated:** February 10, 2026  
**Status:** Ready to test!
