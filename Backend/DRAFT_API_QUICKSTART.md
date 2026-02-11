# Quick Start Guide: Draft Registration with Redis Cache

## Prerequisites
- Redis server installed and running
- PHP Redis extension installed
- Laravel application configured

## Installation Steps

### 1. Install Redis (Ubuntu/Debian)
```bash
# Run the automated setup script
sudo bash setup_redis.sh
```

**OR manually:**
```bash
sudo apt update
sudo apt install redis-server redis-tools php-redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. Verify Installation
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Test PHP Redis extension
php -m | grep redis
# Should show: redis

# Run comprehensive test
php test_redis_cache.php
```

### 3. Configure Laravel
The `.env` file has already been updated with:
```env
CACHE_STORE=redis
```

### 4. Clear Laravel Cache
```bash
cd /home/sakshiladkat/Desktop/Project_internship/Backend
php artisan cache:clear
php artisan config:clear
```

## API Endpoints

### Base URL
```
http://127.0.0.1:8000/api/registration
```

### 1. Save Draft
**Endpoint:** `POST /api/registration/save-draft`

**Request Body:**
```json
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
  "office_number": "1234567890"
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

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/registration/save-draft \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "city": "New York"
  }'
```

### 2. Get Draft
**Endpoint:** `POST /api/registration/get-draft`

**Request Body:**
```json
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
    "city": "New York",
    "saved_at": "2026-02-10T10:59:31",
    "expires_at": "2026-02-10T11:29:31"
  },
  "expiresAt": "2026-02-10T11:29:31"
}
```

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/registration/get-draft \
  -H "Content-Type: application/json" \
  -d '{
    "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }'
```

### 3. Delete Draft
**Endpoint:** `POST /api/registration/delete-draft`

**Request Body:**
```json
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

**cURL Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/registration/delete-draft \
  -H "Content-Type: application/json" \
  -d '{
    "token": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }'
```

## Frontend Integration

### HTML Form with Auto-Save
```html
<!DOCTYPE html>
<html>
<head>
    <title>Registration with Auto-Save</title>
</head>
<body>
    <form id="registrationForm">
        <input type="email" name="email" placeholder="Email" required>
        <input type="text" name="first_name" placeholder="First Name" required>
        <input type="text" name="last_name" placeholder="Last Name" required>
        <input type="text" name="city" placeholder="City">
        <button type="submit">Submit</button>
    </form>
    
    <div id="saveStatus"></div>
    
    <script src="registration-draft.js"></script>
</body>
</html>
```

### JavaScript Implementation
```javascript
// registration-draft.js

const API_BASE = 'http://127.0.0.1:8000/api/registration';
let saveTimeout;
let draftToken = localStorage.getItem('registrationDraftToken');

// Load draft on page load
window.addEventListener('DOMContentLoaded', async () => {
    if (draftToken) {
        await loadDraft();
    }
});

// Auto-save on form input
document.getElementById('registrationForm').addEventListener('input', (e) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveDraft();
    }, 2000); // Save 2 seconds after user stops typing
});

// Save draft function
async function saveDraft() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Add existing draft token if available
    if (draftToken) {
        data.draftToken = draftToken;
    }
    
    try {
        const response = await fetch(`${API_BASE}/save-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            draftToken = result.draftToken;
            localStorage.setItem('registrationDraftToken', draftToken);
            
            showStatus('Draft saved ✓', 'success');
            console.log('Draft saved:', result);
        } else {
            showStatus('Failed to save draft', 'error');
        }
    } catch (error) {
        console.error('Save draft error:', error);
        showStatus('Error saving draft', 'error');
    }
}

// Load draft function
async function loadDraft() {
    try {
        const response = await fetch(`${API_BASE}/get-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: draftToken })
        });
        
        const result = await response.json();
        
        if (response.ok && result.draft) {
            // Populate form with draft data
            const form = document.getElementById('registrationForm');
            Object.keys(result.draft).forEach(key => {
                const input = form.elements[key];
                if (input && result.draft[key]) {
                    input.value = result.draft[key];
                }
            });
            
            showStatus('Draft loaded ✓', 'success');
            console.log('Draft loaded:', result.draft);
        } else {
            // Draft not found or expired
            localStorage.removeItem('registrationDraftToken');
            draftToken = null;
        }
    } catch (error) {
        console.error('Load draft error:', error);
        localStorage.removeItem('registrationDraftToken');
        draftToken = null;
    }
}

// Delete draft function
async function deleteDraft() {
    if (!draftToken) return;
    
    try {
        const response = await fetch(`${API_BASE}/delete-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: draftToken })
        });
        
        if (response.ok) {
            localStorage.removeItem('registrationDraftToken');
            draftToken = null;
            showStatus('Draft deleted', 'success');
        }
    } catch (error) {
        console.error('Delete draft error:', error);
    }
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('saveStatus');
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
    }, 3000);
}

// Form submission
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Submit the actual registration
    // ... your registration logic here ...
    
    // After successful registration, delete the draft
    await deleteDraft();
});
```

## Testing with Postman

### Collection Setup
1. Create a new collection: "Registration Draft API"
2. Add environment variables:
   - `base_url`: `http://127.0.0.1:8000/api/registration`
   - `draft_token`: (will be set automatically)

### Test Sequence

#### 1. Save Draft
- **Method:** POST
- **URL:** `{{base_url}}/save-draft`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```
- **Tests Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Draft token returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.draftToken).to.exist;
    pm.environment.set("draft_token", jsonData.draftToken);
});
```

#### 2. Get Draft
- **Method:** POST
- **URL:** `{{base_url}}/get-draft`
- **Body (JSON):**
```json
{
  "token": "{{draft_token}}"
}
```
- **Tests Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Draft data returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.draft).to.exist;
    pm.expect(jsonData.draft.email).to.eql("test@example.com");
});
```

#### 3. Delete Draft
- **Method:** POST
- **URL:** `{{base_url}}/delete-draft`
- **Body (JSON):**
```json
{
  "token": "{{draft_token}}"
}
```

## Redis Monitoring Commands

### View all draft keys
```bash
redis-cli KEYS "internship-project-demo-cache-register_draft_*"
```

### View specific draft
```bash
redis-cli GET "internship-project-demo-cache-register_draft_{token}"
```

### Count total drafts
```bash
redis-cli KEYS "internship-project-demo-cache-register_draft_*" | wc -l
```

### Monitor real-time operations
```bash
redis-cli MONITOR
```

### Clear all drafts (for testing)
```bash
redis-cli KEYS "internship-project-demo-cache-register_draft_*" | xargs redis-cli DEL
```

## Troubleshooting

### Error: "Connection refused"
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server
```

### Error: "Class 'Redis' not found"
```bash
# Install PHP Redis extension
sudo apt install php-redis

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

### Error: "Draft not found"
- The draft may have expired (30-minute TTL)
- Check if the token is correct
- Verify Redis is running

### Clear Laravel cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Best Practices

1. **Auto-save frequency:** 2-3 seconds after user stops typing
2. **Token storage:** Use localStorage (persists across tabs)
3. **Error handling:** Always handle 404/410 responses
4. **User feedback:** Show save status and expiration time
5. **Cleanup:** Delete draft after successful registration
6. **Security:** Never store passwords in drafts

## Next Steps

1. Install Redis using `sudo bash setup_redis.sh`
2. Test with `php test_redis_cache.php`
3. Clear Laravel cache
4. Test endpoints with Postman or cURL
5. Integrate with your frontend form

For detailed documentation, see: `REDIS_CACHE_IMPLEMENTATION.md`
