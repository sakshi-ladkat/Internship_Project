# Frontend Integration Guide - Cache-Based Email Verification

## Quick Start

### Step 1: Request Email Verification

```javascript
// When user submits email for verification
async function requestEmailVerification(email) {
  try {
    const response = await fetch('/api/pre-register/send-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store email for later use
      sessionStorage.setItem('pendingEmail', email);
      alert('Verification link sent! Please check your email.');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send verification email');
  }
}
```

### Step 2: Handle Email Verification Success

On your `email_verification_success.html` page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Verified</title>
</head>
<body>
  <h1>Email Verified Successfully!</h1>
  <p>Redirecting to account creation...</p>
  
  <script>
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token for account creation
      sessionStorage.setItem('accountToken', token);
      
      // Redirect to account creation page after 2 seconds
      setTimeout(() => {
        window.location.href = '/frontend/pages/create_account.html';
      }, 2000);
    } else {
      alert('Invalid verification link');
    }
  </script>
</body>
</html>
```

### Step 3: Create Account Page

On your `create_account.html` page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Create Account</title>
</head>
<body>
  <h1>Create Your Account</h1>
  
  <form id="createAccountForm">
    <div>
      <label>Email:</label>
      <input type="email" id="email" readonly>
    </div>
    
    <div>
      <label>Username:</label>
      <input type="text" id="username" required>
      <span id="usernameStatus"></span>
    </div>
    
    <div>
      <label>Password:</label>
      <input type="password" id="password" required minlength="8">
    </div>
    
    <div>
      <label>Confirm Password:</label>
      <input type="password" id="password_confirmation" required>
    </div>
    
    <button type="submit">Create Account</button>
  </form>
  
  <script>
    const token = sessionStorage.getItem('accountToken');
    const email = sessionStorage.getItem('pendingEmail');
    
    if (!token || !email) {
      alert('Invalid session. Please start over.');
      window.location.href = '/frontend/pages/register.html';
    }
    
    // Load verified email and suggested username
    async function loadVerifiedEmail() {
      try {
        const response = await fetch('/api/get-verified-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          document.getElementById('email').value = data.email;
          document.getElementById('username').value = data.username;
        } else {
          alert(data.message);
          window.location.href = '/frontend/pages/register.html';
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    // Check username availability
    let usernameCheckTimeout;
    document.getElementById('username').addEventListener('input', function() {
      clearTimeout(usernameCheckTimeout);
      const username = this.value;
      
      usernameCheckTimeout = setTimeout(async () => {
        if (username.length >= 3) {
          try {
            const response = await fetch('/api/check-username', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username })
            });
            
            const data = await response.json();
            const statusEl = document.getElementById('usernameStatus');
            
            if (data.available) {
              statusEl.textContent = '✓ Available';
              statusEl.style.color = 'green';
            } else {
              statusEl.textContent = '✗ Taken. Suggestions: ' + data.suggestions.join(', ');
              statusEl.style.color = 'red';
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }
      }, 500);
    });
    
    // Handle form submission
    document.getElementById('createAccountForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const password = document.getElementById('password').value;
      const passwordConfirmation = document.getElementById('password_confirmation').value;
      
      if (password !== passwordConfirmation) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch('/api/create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: passwordConfirmation
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Clear session storage
          sessionStorage.removeItem('accountToken');
          sessionStorage.removeItem('pendingEmail');
          
          alert('Account created successfully!');
          window.location.href = '/frontend/pages/login.html';
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to create account');
      }
    });
    
    // Load email on page load
    loadVerifiedEmail();
  </script>
</body>
</html>
```

## Important Notes

### 1. Session Storage
Store these values in `sessionStorage`:
- `pendingEmail`: The email address being verified
- `accountToken`: The token received after email verification

### 2. Required Parameters

**Get Verified Email:**
- `token` (required)
- `email` (required)

**Create Account:**
- `token` (required)
- `email` (required)
- `password` (required, min 8 characters)
- `password_confirmation` (required, must match password)

### 3. Error Handling

Common error responses:

| Status | Message | Action |
|--------|---------|--------|
| 403 | Invalid or expired verification token | Redirect to registration |
| 409 | Email is already registered | Show error, redirect to login |
| 429 | Too many requests | Show rate limit message |

### 4. Token Expiration

- Unverified email: 15 minutes
- Verified email (account token): 1 hour

Make sure users complete account creation within 1 hour of email verification.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters email                                        │
│    POST /api/pre-register/send-link                         │
│    Store email in sessionStorage                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User clicks link in email                                │
│    GET /api/pre-register/verify?email={email}&token={token} │
│    Redirects to: email_verification_success.html?token=XXX  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Success page extracts token                              │
│    Store token in sessionStorage                            │
│    Redirect to create_account.html                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Create account page loads                                │
│    POST /api/get-verified-email (token + email)             │
│    Display email and suggested username                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User fills form and submits                              │
│    POST /api/create-account (token + email + password)      │
│    Clear sessionStorage                                     │
│    Redirect to login                                        │
└─────────────────────────────────────────────────────────────┘
```

## Testing

1. Open browser console
2. Test email verification flow
3. Check sessionStorage values:
   ```javascript
   console.log(sessionStorage.getItem('pendingEmail'));
   console.log(sessionStorage.getItem('accountToken'));
   ```
4. Verify API responses in Network tab

## Troubleshooting

**Problem:** "Invalid or expired verification token"
- Check if email is stored in sessionStorage
- Verify token hasn't expired (1 hour limit)
- Ensure both token and email are sent in request

**Problem:** "Email is already registered"
- User already has an account
- Redirect to login page

**Problem:** Username not checking availability
- Check network tab for errors
- Verify username meets requirements (3-20 chars)
