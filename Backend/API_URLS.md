# API Endpoints and URLs Reference

## Base URLs

### Backend API
```
http://127.0.0.1:8000
```

### Frontend Application
```
http://127.0.0.1:5502/frontend
```

---

## Authentication Endpoints

### Login
```
POST http://127.0.0.1:8000/api/auth/login
```
**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

### Logout
```
POST http://127.0.0.1:8000/api/auth/logout
```

### Get Authenticated User
```
POST http://127.0.0.1:8000/api/auth/me
```

### Refresh Session
```
POST http://127.0.0.1:8000/api/auth/refresh
```

### Update Profile
```
POST http://127.0.0.1:8000/api/auth/update-profile
```
**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Change Password
```
POST http://127.0.0.1:8000/api/auth/change-password
```
**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword",
  "new_password_confirmation": "newpassword"
}
```

---

## Registration Endpoints

### Send Email Verification
```
POST http://127.0.0.1:8000/api/registration/send-verification
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Resend Verification Link
```
POST http://127.0.0.1:8000/api/registration/resend-verification
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Verify Email (Email Link)
```
GET http://127.0.0.1:8000/api/registration/verify-email?token={token}&email={email}
```
**Redirects to:**
```
http://127.0.0.1:5502/frontend/index.html#/multi-step-register?token={token}&email={email}
```

### Save Registration Data
```
POST http://127.0.0.1:8000/api/registration/save-data
```
**Request Body:**
```json
{
  "token": "verification_token",
  "email": "user@example.com",
  "institute_id": 1,
  "first_name": "John",
  "middle_name": "M",
  "last_name": "Doe",
  "suffix": "Jr.",
  "address_line1": "123 Main St",
  "address_line2": "Apt 4",
  "address_line3": "",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "continent": "North America",
  "country": "United States",
  "office_country_code": "+1",
  "office_city_code": "212",
  "office_number": "5551234",
  "fax_number": "5555678"
}
```

### Setup Password Page (Email Link)
```
GET http://127.0.0.1:8000/api/registration/setup-password?token={token}&email={email}
```
**Redirects to:**
```
http://127.0.0.1:5502/frontend/index.html#/setup-password?token={token}&email={email}
```

### Set Password
```
POST http://127.0.0.1:8000/api/registration/set-password
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "password_setup_token",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

### Save Draft (Redis Cache)
```
POST http://127.0.0.1:8000/api/registration/save-draft
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "institute_id": 1,
  "city": "New York",
  "state": "NY",
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

### Get Draft (Redis Cache)
```
POST http://127.0.0.1:8000/api/registration/get-draft
```
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

### Delete Draft (Redis Cache)
```
POST http://127.0.0.1:8000/api/registration/delete-draft
```
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

### List Drafts (Redis Cache)
```
POST http://127.0.0.1:8000/api/registration/list-drafts
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "To retrieve a draft, you need the draft token that was provided when saving.",
  "note": "Draft tokens are stored in browser localStorage or returned in the save response."
}
```

---

## Institute Endpoints

### Get All Institutes
```
GET http://127.0.0.1:8000/api/institutes
```
**Response:**
```json
{
  "institutes": [
    {
      "id": 16,
      "name": "Chennai Mathematical Institute (CMI)",
      "country": "India",
      "city": "Chennai"
    }
  ]
}
```

### Get Specific Institute
```
GET http://127.0.0.1:8000/api/institutes/{id}
```

---

## Location Endpoints

### Get Continents
```
GET http://127.0.0.1:8000/api/locations/continents
```
**Response:**
```json
{
  "continents": [
    "Africa",
    "Antarctica",
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America"
  ]
}
```

### Get Countries by Continent
```
POST http://127.0.0.1:8000/api/locations/countries
```
**Request Body:**
```json
{
  "continent": "Asia"
}
```
**Response:**
```json
{
  "countries": [
    "China",
    "India",
    "Japan",
    "Singapore",
    "South Korea",
    "Thailand"
  ]
}
```

---

## Profile Management Endpoints

### Get Profile
```
GET http://127.0.0.1:8000/api/profile/get-profile
```

### Save Personal Info
```
POST http://127.0.0.1:8000/api/profile/personal-info
```

### Upload Profile Photo
```
POST http://127.0.0.1:8000/api/profile/upload-photo
```

### Save Academic Info
```
POST http://127.0.0.1:8000/api/profile/academic-info
```

### Save Affiliation Info
```
POST http://127.0.0.1:8000/api/profile/affiliation-info
```

### Save Project Info
```
POST http://127.0.0.1:8000/api/profile/project-info
```

### Get Master Data
```
GET http://127.0.0.1:8000/api/profile/master-data
```

### Get Departments by Institute
```
GET http://127.0.0.1:8000/api/profile/departments/{instituteId}
```

### Get Sub-Departments by Department
```
GET http://127.0.0.1:8000/api/profile/sub-departments/{departmentId}
```

### Get Cities by State
```
GET http://127.0.0.1:8000/api/profile/cities/{state}
```

---

## Admin Endpoints

### Get Users
```
GET http://127.0.0.1:8000/api/admin/users
```

### Get Roles
```
GET http://127.0.0.1:8000/api/admin/roles
```

### Get Permissions
```
GET http://127.0.0.1:8000/api/admin/permissions
```

### Save Role
```
POST http://127.0.0.1:8000/api/admin/save-role
```

### Assign Roles
```
POST http://127.0.0.1:8000/api/admin/assign-roles
```

---

## Request Management Endpoints

### Create Request
```
POST http://127.0.0.1:8000/api/requests/store
```

### Get User Requests
```
GET http://127.0.0.1:8000/api/requests/user
```

### Get All Requests
```
GET http://127.0.0.1:8000/api/requests/all
```

---

## SSH Key Management Endpoints

### Get SSH Keys
```
GET http://127.0.0.1:8000/api/ssh-keys
```

### Create SSH Key
```
POST http://127.0.0.1:8000/api/ssh-keys
```

### Update SSH Key
```
PUT http://127.0.0.1:8000/api/ssh-keys/{id}
```

### Delete SSH Key
```
DELETE http://127.0.0.1:8000/api/ssh-keys/{id}
```

---

## Frontend Routes (SPA)

### Home
```
http://127.0.0.1:5502/frontend/index.html#/
```

### Login
```
http://127.0.0.1:5502/frontend/index.html#/login
```

### Multi-Step Registration
```
http://127.0.0.1:5502/frontend/index.html#/multi-step-register
```

### Setup Password
```
http://127.0.0.1:5502/frontend/index.html#/setup-password
```

### Dashboard
```
http://127.0.0.1:5502/frontend/index.html#/dashboard
```

---

## Email Verification Flow

### Step 1: User Requests Verification
```
POST http://127.0.0.1:8000/api/registration/send-verification
Body: { "email": "user@example.com" }
```

### Step 2: User Clicks Email Link
```
GET http://127.0.0.1:8000/api/registration/verify-email?token={token}&email={email}
↓ Redirects to ↓
http://127.0.0.1:5502/frontend/index.html#/multi-step-register?token={token}&email={email}
```

### Step 3: User Completes Registration
```
POST http://127.0.0.1:8000/api/registration/save-data
Body: { token, email, institute_id, personal_info, contact_info }
```

### Step 4: User Clicks Password Setup Email Link
```
GET http://127.0.0.1:8000/api/registration/setup-password?token={token}&email={email}
↓ Redirects to ↓
http://127.0.0.1:5502/frontend/index.html#/setup-password?token={token}&email={email}
```

### Step 5: User Sets Password
```
POST http://127.0.0.1:8000/api/registration/set-password
Body: { email, token, password, password_confirmation }
```

---

## Error Redirects

### Invalid Token
```
http://127.0.0.1:5502/frontend/index.html#/multi-step-register?error=invalid
```

### Expired Token
```
http://127.0.0.1:5502/frontend/index.html#/multi-step-register?error=expired
```

### Already Verified
```
http://127.0.0.1:5502/frontend/index.html#/multi-step-register?token={token}&email={email}&message=already_verified
```

---

## Rate Limits

### Email Verification
- **Limit:** 3 requests per minute per IP+email
- **Response:** HTTP 429 (Too Many Requests)

### Resend Verification
- **Limit:** 2 requests per 10 minutes per IP+email
- **Response:** HTTP 429 (Too Many Requests)

---

## Environment Variables

### Backend (.env)
```env
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5502/frontend
```

### Frontend (config.js)
```javascript
CONFIG.API_BASE_URL = 'http://127.0.0.1:8000'
```

---

## CORS Allowed Origins

```
http://127.0.0.1:5500
http://127.0.0.1:5502
http://127.0.0.1:8000
http://localhost:5500
http://localhost:5502
http://localhost:3000
http://localhost:8080
```

---

## Quick Reference

### Start Backend Server
```bash
cd Backend
php artisan serve
# Runs on http://127.0.0.1:8000
```

### Start Frontend Server
```bash
# Use Live Server on port 5502
# Or any static file server
```

### Test API Endpoint
```bash
curl http://127.0.0.1:8000/api/institutes
```

### Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

**Last Updated:** 2026-02-09  
**Backend Port:** 8000  
**Frontend Port:** 5502
