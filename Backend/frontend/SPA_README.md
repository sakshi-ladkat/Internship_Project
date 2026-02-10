# Single Page Application (SPA) - Frontend

## 🎉 Overview

This is a modern, premium Single Page Application (SPA) built with vanilla JavaScript, featuring:

- ✨ **Beautiful UI** - Premium design with smooth animations and transitions
- 🚀 **Fast Navigation** - Client-side routing with no page reloads
- 📱 **Responsive** - Works perfectly on all devices
- 🎨 **Modern Design** - Glassmorphism, gradients, and micro-animations
- 🔒 **Secure** - Cache-based email verification system

## 🏗️ Architecture

### File Structure

```
frontend/
├── index.html                 # Main SPA entry point
├── assets/
│   ├── css/
│   │   └── spa.css           # Complete design system
│   └── js/
│       ├── config.js         # API configuration
│       ├── spa-router.js     # Client-side router
│       └── spa-app.js        # Application logic & views
├── pages/                     # Old multi-page files (deprecated)
└── components/                # Reusable components
```

### Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Hash-based Routing** - Client-side navigation

## 🎨 Design System

### Color Palette

The app uses a sophisticated HSL-based color system:

- **Primary**: Purple gradient (hsl(250, 75%, 55%))
- **Success**: Green (hsl(142, 76%, 45%))
- **Error**: Red (hsl(0, 84%, 60%))
- **Warning**: Orange (hsl(38, 92%, 50%))
- **Info**: Blue (hsl(199, 89%, 48%))

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Scale**: Modular scale from 0.75rem to 2.25rem

### Spacing

Consistent spacing scale using CSS custom properties:
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem
- 3xl: 4rem

## 🛣️ Routes

| Route | Description |
|-------|-------------|
| `#/` | Home page with features |
| `#/register` | Email verification request |
| `#/verification-success` | Email verified confirmation |
| `#/create-account` | Complete account setup |
| `#/login` | User login |

## 🔄 User Flow

### Registration Flow

1. **User visits** `#/register`
2. **Enters email** → API sends verification link
3. **Clicks email link** → Redirected to `#/verification-success`
4. **Auto-redirected** to `#/create-account`
5. **Completes form** → Account created
6. **Redirected** to `#/login`

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User enters email                                    │
│    → Stored in sessionStorage                           │
│    → API: POST /api/pre-register/send-link             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. User clicks email link                               │
│    → Backend verifies token                             │
│    → Redirects to SPA with account token                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. SPA extracts token from URL                          │
│    → Stores in sessionStorage                           │
│    → Navigates to #/verification-success                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Auto-redirect to #/create-account                    │
│    → API: POST /api/get-verified-email                  │
│    → Displays email and suggested username              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. User completes form                                  │
│    → API: POST /api/create-account                      │
│    → Account created, redirect to login                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### 1. Start the Frontend

Simply open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 5500

# Using Node.js
npx http-server -p 5500

# Using PHP
php -S localhost:5500
```

### 2. Configure API Endpoint

Edit `assets/js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8000' // Your Laravel API
};
```

### 3. Access the App

Open your browser to:
```
http://127.0.0.1:5500/frontend/index.html
```

## 🎯 Features

### Client-Side Routing

The SPA uses hash-based routing for seamless navigation:

```javascript
// Navigate programmatically
window.location.hash = '/register';

// Or use links
<a href="#/register" data-link>Register</a>
```

### Toast Notifications

Beautiful toast notifications for user feedback:

```javascript
showToast('Success message', 'success');
showToast('Error message', 'error');
showToast('Warning message', 'warning');
showToast('Info message', 'info');
```

### Form Validation

Real-time form validation with visual feedback:

- Email format validation
- Password strength checking
- Username availability checking
- Password confirmation matching

### Loading States

Smooth loading indicators:

- Page transitions with fade effects
- Button loading states
- Full-page loading spinner

## 🎨 Customization

### Changing Colors

Edit CSS variables in `assets/css/spa.css`:

```css
:root {
    --primary-hue: 250; /* Change to any hue (0-360) */
    --primary-600: hsl(var(--primary-hue), 70%, 45%);
}
```

### Adding New Routes

Add routes in `assets/js/spa-app.js`:

```javascript
const routes = [
    {
        path: '/my-page',
        view: myPageView,
        onMount: myPageMount // Optional
    }
];
```

### Creating New Views

```javascript
function myPageView() {
    return `
        <div class="card">
            <h2 class="card-title">My Page</h2>
            <p>Content here</p>
        </div>
    `;
}

function myPageMount() {
    // Run code after view is rendered
    console.log('Page mounted!');
}
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Desktop**: > 768px
- **Mobile**: ≤ 768px

Mobile-specific optimizations:
- Stacked navigation
- Full-width forms
- Adjusted spacing
- Touch-friendly buttons

## ⚡ Performance

### Optimizations

- **No Framework Overhead** - Pure vanilla JS
- **Lazy Loading** - Views loaded on demand
- **CSS Custom Properties** - Fast theme switching
- **Minimal Dependencies** - Only Google Fonts
- **Efficient Routing** - Hash-based, no server requests

### Best Practices

- Semantic HTML5
- Accessible forms and buttons
- SEO-friendly structure
- Progressive enhancement

## 🔒 Security

- CSRF token support (ready for API integration)
- XSS prevention (sanitized inputs)
- Secure session storage
- Rate limiting (backend)

## 🐛 Debugging

### Enable Console Logging

```javascript
// In spa-app.js, add:
console.log('Current route:', router.currentRoute);
console.log('Session data:', sessionStorage);
```

### Common Issues

**Issue**: Routes not working
- **Solution**: Ensure hash is properly formatted (`#/route`)

**Issue**: API calls failing
- **Solution**: Check CORS settings in Laravel backend

**Issue**: Styles not loading
- **Solution**: Verify CSS file path in index.html

## 📚 API Integration

### Required Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/pre-register/send-link` | Send verification email |
| POST | `/api/get-verified-email` | Get verified email data |
| POST | `/api/check-username` | Check username availability |
| POST | `/api/create-account` | Create user account |

### Request/Response Examples

**Send Verification Link**
```javascript
// Request
{
    "email": "user@example.com"
}

// Response
{
    "message": "Verification link sent successfully!",
    "email": "user@example.com"
}
```

**Create Account**
```javascript
// Request
{
    "token": "account_token_here",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}

// Response
{
    "message": "Account created successfully.",
    "user_id": 1
}
```

## 🎓 Learning Resources

### Understanding the Code

1. **spa-router.js** - Learn about client-side routing
2. **spa-app.js** - See view composition and state management
3. **spa.css** - Study modern CSS architecture

### Key Concepts

- **Hash Routing**: Using `window.location.hash` for navigation
- **View Functions**: Returning HTML strings for dynamic content
- **Lifecycle Hooks**: `onMount` callbacks after view render
- **State Management**: Using `sessionStorage` for temporary data

## 🚀 Deployment

### Production Checklist

- [ ] Update `CONFIG.API_BASE_URL` to production API
- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Enable HTTPS
- [ ] Configure CDN for assets
- [ ] Set up error tracking
- [ ] Add analytics

### Build for Production

```bash
# Minify CSS
npx csso assets/css/spa.css -o assets/css/spa.min.css

# Minify JavaScript
npx terser assets/js/spa-router.js -o assets/js/spa-router.min.js
npx terser assets/js/spa-app.js -o assets/js/spa-app.min.js
```

## 📄 License

This project is part of the Internship Project.

## 🤝 Contributing

Feel free to enhance the SPA with:
- Additional views
- New animations
- Improved accessibility
- Better error handling
- More features

---

**Built with ❤️ using Vanilla JavaScript**
