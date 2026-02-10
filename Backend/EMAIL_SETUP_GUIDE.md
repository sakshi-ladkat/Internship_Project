# 📧 Email Configuration - Complete Guide

## ✅ Email Now Working!

Your Ethereal email account is properly configured and emails are being sent successfully.

## 📋 Current Configuration

**File**: `.env`

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USERNAME=jason.cummerata@ethereal.email
MAIL_PASSWORD=hpg9zZzH8FzX6fu2pU
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@test.com
MAIL_FROM_NAME="internship_project_demo"
```

## 🔍 How to View Sent Emails

### Option 1: Ethereal Web Interface (Recommended)

1. **Go to**: https://ethereal.email/login
2. **Login with**:
   - Email: `jason.cummerata@ethereal.email`
   - Password: `hpg9zZzH8FzX6fu2pU`
3. **View Messages**: All sent emails will appear in your inbox

### Option 2: Direct Message Link

After sending an email, check the Laravel logs for a message link:
```bash
tail -f storage/logs/laravel.log | grep "ethereal.email"
```

## 🧪 Testing Email Functionality

### Test 1: Send Verification Email
```bash
curl -X POST http://127.0.0.1:8000/api/pre-register/send-link \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response**:
```json
{
  "message": "Verification link sent successfully! Please check your email.",
  "email": "test@example.com"
}
```

### Test 2: Check Ethereal Inbox
1. Login to https://ethereal.email/login
2. You should see the verification email
3. Click to view the email content
4. Copy the verification link

### Test 3: Complete Flow
1. **Send email** via API or frontend
2. **Check Ethereal inbox** for verification email
3. **Click verification link** in email
4. **Should redirect** to SPA with token
5. **Complete account creation**

## 📊 Email Details

### What Gets Sent

**Subject**: Email Verification (or as configured in your VerificationMail class)

**Content**: 
- Verification link with token
- Expiration time (15 minutes)
- Instructions for user

**Link Format**:
```
http://127.0.0.1:8000/api/pre-register/verify?email={email}&token={token}
```

This redirects to:
```
http://127.0.0.1:5500/frontend/index.html?token={account_token}#/verification-success
```

## 🔧 Troubleshooting

### Issue: "Failed to send verification email"

**Solution 1**: Clear config cache
```bash
php artisan config:clear
php artisan cache:clear
```

**Solution 2**: Check credentials
- Verify username and password in `.env`
- Make sure no extra spaces

**Solution 3**: Check Laravel logs
```bash
tail -50 storage/logs/laravel.log
```

### Issue: Email not appearing in Ethereal

**Possible Causes**:
1. Wrong credentials
2. Rate limiting (wait 1 minute)
3. Network issues

**Solution**: Check the API response for errors

### Issue: Verification link not working

**Check**:
1. Link format is correct
2. Token hasn't expired (15 min)
3. Backend server is running
4. Frontend server is running

## 📝 Email Templates

Your verification email is defined in:
```
app/Mail/VerificationMail.php
```

To customize the email:
1. Edit the VerificationMail class
2. Create a Blade template in `resources/views/emails/`
3. Update the mail configuration

## 🎯 Complete User Flow

```
1. User enters email on frontend
   ↓
2. Frontend calls: POST /api/pre-register/send-link
   ↓
3. Backend stores in cache (15 min TTL)
   ↓
4. Backend sends email via Ethereal SMTP
   ↓
5. User checks Ethereal inbox
   ↓
6. User clicks verification link
   ↓
7. Backend verifies token
   ↓
8. Backend redirects to SPA with account token
   ↓
9. User completes account creation
   ↓
10. Account created, cache cleared
```

## 🌐 Viewing Emails in Real-Time

### Method 1: Web Interface
- URL: https://ethereal.email/messages
- Login required
- Shows all emails
- Can view HTML and plain text versions

### Method 2: IMAP Client (Optional)
```
Host: imap.ethereal.email
Port: 993
Security: TLS
Username: jason.cummerata@ethereal.email
Password: hpg9zZzH8FzX6fu2pU
```

### Method 3: POP3 Client (Optional)
```
Host: pop3.ethereal.email
Port: 995
Security: TLS
Username: jason.cummerata@ethereal.email
Password: hpg9zZzH8FzX6fu2pU
```

## 🔐 Security Notes

### About Ethereal Email

- **Test Service**: Ethereal is for development/testing only
- **Not Real**: Emails don't actually get delivered to recipients
- **Temporary**: Messages may be deleted after some time
- **Public**: Anyone with credentials can view emails

### For Production

Replace Ethereal with a real email service:

**Option 1: Gmail SMTP**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

**Option 2: SendGrid**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

**Option 3: Mailgun**
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
```

## ✅ Verification Checklist

- [x] Email configuration in `.env`
- [x] Config cache cleared
- [x] Test email sent successfully
- [x] Can login to Ethereal web interface
- [x] Verification links working
- [x] SPA redirects working

## 🎉 Success!

Your email system is now fully functional! You can:
- ✅ Send verification emails
- ✅ View them in Ethereal inbox
- ✅ Click verification links
- ✅ Complete the registration flow

---

**Quick Test Command**:
```bash
curl -X POST http://127.0.0.1:8000/api/pre-register/send-link \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"mytest@example.com"}'
```

Then check: https://ethereal.email/login

**Status**: 🟢 **FULLY OPERATIONAL**
