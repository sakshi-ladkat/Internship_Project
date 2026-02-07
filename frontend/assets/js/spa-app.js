/**
 * SPA Application
 * Main application logic and view definitions
 */

// ========================================
// VIEW: Home Page
// ========================================
function homeView() {
    return `
        <div class="card" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <div class="card-header">
                <h1 class="card-title" style="font-size: 3rem;">Welcome to AuthApp</h1>
                <p class="card-subtitle">Secure authentication made simple</p>
            </div>
            
            <div style="margin: 2rem 0;">
                <svg style="width: 200px; height: 200px; margin: 0 auto; display: block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="#/multi-step-register" class="btn btn-primary" data-link>Get Started</a>
                <a href="#/login" class="btn btn-outline" data-link>Sign In</a>
            </div>
            
            <div style="margin-top: 3rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <div style="padding: 1.5rem; background: var(--primary-50); border-radius: var(--radius-lg);">
                    <h3 style="color: var(--primary-600); margin-bottom: 0.5rem;">🔒 Secure</h3>
                    <p style="font-size: 0.875rem; color: var(--gray-600);">Industry-standard encryption and security</p>
                </div>
                <div style="padding: 1.5rem; background: var(--success-light); border-radius: var(--radius-lg);">
                    <h3 style="color: var(--success); margin-bottom: 0.5rem;">⚡ Fast</h3>
                    <p style="font-size: 0.875rem; color: var(--gray-600);">Lightning-fast email verification</p>
                </div>
                <div style="padding: 1.5rem; background: var(--info-light); border-radius: var(--radius-lg);">
                    <h3 style="color: var(--info); margin-bottom: 0.5rem;">✨ Simple</h3>
                    <p style="font-size: 0.875rem; color: var(--gray-600);">Easy to use, no complexity</p>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// VIEW: Email Verification (Register)
// ========================================
function registerView() {
    return `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <div class="card-header">
                <h2 class="card-title">Create Account</h2>
                <p class="card-subtitle">Enter your email to get started</p>
            </div>
            
            <form id="registerForm">
                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        required
                    >
                    <div class="form-hint">We'll send you a verification link</div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block" id="submitBtn">
                    Send Verification Link
                </button>
                
                <div id="message" class="mt-md"></div>
            </form>
            
            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--gray-600);">
                Already have an account? 
                <a href="#/login" style="color: var(--primary-600); text-decoration: none; font-weight: 600;" data-link>Sign in</a>
            </div>
        </div>
    `;
}

function registerMount() {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;

        // Store email in session storage
        sessionStorage.setItem('pendingEmail', email);

        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/pre-register/send-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `
                    <div class="form-success">
                        ✓ ${data.message}
                    </div>
                `;
                showToast('Verification email sent successfully!', 'success');
                form.reset();
            } else {
                messageDiv.innerHTML = `
                    <div class="form-error">
                        ✗ ${data.message}
                    </div>
                `;
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = `
                <div class="form-error">
                    ✗ Failed to send verification email. Please try again.
                </div>
            `;
            showToast('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// VIEW: Email Verification Success
// ========================================
function verificationSuccessView() {
    // Get token from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        sessionStorage.setItem('accountToken', token);

        // Auto redirect after 2 seconds
        setTimeout(() => {
            window.location.hash = '/create-account';
        }, 2000);
    }

    return `
        <div class="card" style="max-width: 500px; margin: 0 auto; text-align: center;">
            <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem; background: var(--success-light); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg style="width: 48px; height: 48px; color: var(--success);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            
            <div class="card-header">
                <h2 class="card-title">Email Verified!</h2>
                <p class="card-subtitle">Your email has been successfully verified</p>
            </div>
            
            <p style="color: var(--gray-600); margin: 1rem 0;">
                Redirecting you to complete your account setup...
            </p>
            
            <div class="spinner" style="margin: 2rem auto;"></div>
            
            <a href="#/create-account" class="btn btn-primary" data-link style="margin-top: 1rem;">
                Continue to Account Setup
            </a>
        </div>
    `;
}

// ========================================
// VIEW: Create Account
// ========================================
function createAccountView() {
    return `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <div class="card-header">
                <h2 class="card-title">Complete Your Account</h2>
                <p class="card-subtitle">Just a few more details</p>
            </div>
            
            <form id="createAccountForm">
                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="form-input" 
                        readonly
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        class="form-input" 
                        placeholder="Choose a username"
                        required
                        minlength="3"
                        maxlength="20"
                    >
                    <div id="usernameStatus" class="mt-sm"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        class="form-input" 
                        placeholder="Choose a strong password"
                        required
                        minlength="8"
                    >
                    <div class="form-hint">Minimum 8 characters</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="password_confirmation">Confirm Password</label>
                    <input 
                        type="password" 
                        id="password_confirmation" 
                        class="form-input" 
                        placeholder="Re-enter your password"
                        required
                    >
                </div>
                
                <button type="submit" class="btn btn-primary btn-block" id="submitBtn">
                    Create Account
                </button>
                
                <div id="message" class="mt-md"></div>
            </form>
        </div>
    `;
}

function createAccountMount() {
    const token = sessionStorage.getItem('accountToken');
    const email = sessionStorage.getItem('pendingEmail');

    if (!token || !email) {
        showToast('Invalid session. Please start over.', 'error');
        window.location.hash = '/register';
        return;
    }

    // Load verified email
    loadVerifiedEmail(token, email);

    // Setup username checking
    setupUsernameCheck();

    // Setup form submission
    setupAccountCreation(token, email);
}

async function loadVerifiedEmail(token, email) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/get-verified-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ token, email })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('email').value = data.email;
            document.getElementById('username').value = data.username;
        } else {
            showToast(data.message, 'error');
            window.location.hash = '/register';
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load email data', 'error');
    }
}

function setupUsernameCheck() {
    const usernameInput = document.getElementById('username');
    const statusDiv = document.getElementById('usernameStatus');
    let timeout;

    usernameInput.addEventListener('input', () => {
        clearTimeout(timeout);
        const username = usernameInput.value;

        if (username.length < 3) {
            statusDiv.innerHTML = '';
            return;
        }

        timeout = setTimeout(async () => {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/check-username`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });

                const data = await response.json();

                if (data.available) {
                    statusDiv.innerHTML = '<div class="form-success">✓ Username available</div>';
                } else {
                    const suggestions = data.suggestions ? data.suggestions.join(', ') : '';
                    statusDiv.innerHTML = `
                        <div class="form-error">
                            ✗ Username taken
                            ${suggestions ? `<br><small>Try: ${suggestions}</small>` : ''}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 500);
    });
}

function setupAccountCreation(token, email) {
    const form = document.getElementById('createAccountForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const passwordConfirmation = document.getElementById('password_confirmation').value;

        if (password !== passwordConfirmation) {
            messageDiv.innerHTML = '<div class="form-error">✗ Passwords do not match</div>';
            showToast('Passwords do not match', 'error');
            return;
        }

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/create-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
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
                sessionStorage.removeItem('accountToken');
                sessionStorage.removeItem('pendingEmail');

                showToast('Account created successfully!', 'success');

                messageDiv.innerHTML = `
                    <div class="form-success">
                        ✓ Account created successfully! Redirecting to login...
                    </div>
                `;

                setTimeout(() => {
                    window.location.hash = '/login';
                }, 2000);
            } else {
                messageDiv.innerHTML = `<div class="form-error">✗ ${data.message}</div>`;
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = '<div class="form-error">✗ Failed to create account</div>';
            showToast('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// VIEW: Login
// ========================================
function loginView() {
    return `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <div class="card-header">
                <h2 class="card-title">Welcome Back</h2>
                <p class="card-subtitle">Sign in to your account</p>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        class="form-input" 
                        placeholder="Enter your password"
                        required
                    >
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Sign In
                </button>
                
                <div id="message" class="mt-md"></div>
            </form>
            
            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--gray-600);">
                Don't have an account? 
                <a href="#/multi-step-register" style="color: var(--primary-600); text-decoration: none; font-weight: 600;" data-link>Create one</a>
            </div>
        </div>
    `;
}

function loginMount() {
    const form = document.getElementById('loginForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store auth token
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('user', JSON.stringify(data.user));

                showToast('Login successful!', 'success');

                messageDiv.innerHTML = `
                    <div class="form-success">
                        ✓ Welcome back, ${data.user.username}!
                    </div>
                `;

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.hash = '/dashboard';
                }, 1000);
            } else {
                messageDiv.innerHTML = `
                    <div class="form-error">
                        ✗ ${data.message}
                    </div>
                `;
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = `
                <div class="form-error">
                    ✗ Failed to login. Please try again.
                </div>
            `;
            showToast('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// VIEW: Dashboard
// ========================================
function dashboardView() {
    const authToken = sessionStorage.getItem('authToken');
    const userStr = sessionStorage.getItem('user');

    if (!authToken || !userStr) {
        window.location.hash = '/login';
        return '<div>Redirecting...</div>';
    }

    const user = JSON.parse(userStr);

    return `
        <div style="max-width: 1000px; margin: 0 auto;">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Welcome, ${user.username}! 👋</h2>
                    <p class="card-subtitle">Manage your account and settings</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                    <!-- Profile Card -->
                    <div style="padding: 1.5rem; background: var(--primary-50); border-radius: var(--radius-lg);">
                        <h3 style="color: var(--primary-600); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Profile Information
                        </h3>
                        <div style="font-size: 0.875rem;">
                            <p style="margin-bottom: 0.5rem;"><strong>Username:</strong> ${user.username}</p>
                            <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${user.email}</p>
                            <p style="margin-bottom: 0.5rem;"><strong>Member since:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        <button id="editProfileBtn" class="btn btn-outline mt-md" style="width: 100%;">
                            Edit Profile
                        </button>
                    </div>

                    <!-- Security Card -->
                    <div style="padding: 1.5rem; background: var(--success-light); border-radius: var(--radius-lg);">
                        <h3 style="color: var(--success); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            Security
                        </h3>
                        <p style="font-size: 0.875rem; margin-bottom: 1rem; color: var(--gray-600);">
                            Keep your account secure by using a strong password
                        </p>
                        <button id="changePasswordBtn" class="btn btn-outline mt-md" style="width: 100%;">
                            Change Password
                        </button>
                    </div>
                </div>

                <!-- Edit Profile Form (Hidden by default) -->
                <div id="editProfileSection" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--gray-200);">
                    <h3 style="margin-bottom: 1rem;">Edit Profile</h3>
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label class="form-label" for="edit_username">Username</label>
                            <input 
                                type="text" 
                                id="edit_username" 
                                class="form-input" 
                                value="${user.username}"
                                required
                                minlength="3"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="edit_email">Email</label>
                            <input 
                                type="email" 
                                id="edit_email" 
                                class="form-input" 
                                value="${user.email}"
                                required
                            >
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" id="cancelEditBtn" class="btn btn-secondary">Cancel</button>
                        </div>
                        
                        <div id="editMessage" class="mt-md"></div>
                    </form>
                </div>

                <!-- Change Password Form (Hidden by default) -->
                <div id="changePasswordSection" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--gray-200);">
                    <h3 style="margin-bottom: 1rem;">Change Password</h3>
                    <form id="changePasswordForm">
                        <div class="form-group">
                            <label class="form-label" for="current_password">Current Password</label>
                            <input 
                                type="password" 
                                id="current_password" 
                                class="form-input" 
                                required
                            >
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="new_password">New Password</label>
                            <input 
                                type="password" 
                                id="new_password" 
                                class="form-input" 
                                required
                                minlength="8"
                            >
                            <div class="form-hint">Minimum 8 characters</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="new_password_confirmation">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="new_password_confirmation" 
                                class="form-input" 
                                required
                            >
                        </div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn btn-primary">Update Password</button>
                            <button type="button" id="cancelPasswordBtn" class="btn btn-secondary">Cancel</button>
                        </div>
                        
                        <div id="passwordMessage" class="mt-md"></div>
                    </form>
                </div>

                <!-- Logout Button -->
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--gray-200); text-align: center;">
                    <button id="logoutBtn" class="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    `;
}

function dashboardMount() {
    const authToken = sessionStorage.getItem('authToken');

    if (!authToken) {
        window.location.hash = '/login';
        return;
    }

    // Setup edit profile toggle
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        const section = document.getElementById('editProfileSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
        document.getElementById('changePasswordSection').style.display = 'none';
    });

    // Setup change password toggle
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        const section = document.getElementById('changePasswordSection');
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
        document.getElementById('editProfileSection').style.display = 'none';
    });

    // Setup cancel buttons
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('editProfileSection').style.display = 'none';
    });

    document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
        document.getElementById('changePasswordSection').style.display = 'none';
        document.getElementById('changePasswordForm').reset();
    });

    // Setup edit profile form
    setupEditProfile(authToken);

    // Setup change password form
    setupChangePassword(authToken);

    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ token: authToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        showToast('Logged out successfully', 'success');
        window.location.hash = '/login';
    });
}

async function setupEditProfile(authToken) {
    const form = document.getElementById('editProfileForm');
    const messageDiv = document.getElementById('editMessage');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('edit_username').value;
        const email = document.getElementById('edit_email').value;

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ token: authToken, username, email })
            });

            const data = await response.json();

            if (response.ok) {
                // Update stored user data
                sessionStorage.setItem('user', JSON.stringify(data.user));

                messageDiv.innerHTML = '<div class="form-success">✓ Profile updated successfully!</div>';
                showToast('Profile updated successfully!', 'success');

                // Reload page to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                messageDiv.innerHTML = `<div class="form-error">✗ ${data.message}</div>`;
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = '<div class="form-error">✗ Failed to update profile</div>';
            showToast('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

async function setupChangePassword(authToken) {
    const form = document.getElementById('changePasswordForm');
    const messageDiv = document.getElementById('passwordMessage');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current_password').value;
        const newPassword = document.getElementById('new_password').value;
        const newPasswordConfirmation = document.getElementById('new_password_confirmation').value;

        if (newPassword !== newPasswordConfirmation) {
            messageDiv.innerHTML = '<div class="form-error">✗ Passwords do not match</div>';
            showToast('Passwords do not match', 'error');
            return;
        }

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        messageDiv.innerHTML = '';

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    token: authToken,
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: newPasswordConfirmation
                })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = '<div class="form-success">✓ Password changed successfully!</div>';
                showToast('Password changed successfully!', 'success');
                form.reset();

                setTimeout(() => {
                    document.getElementById('changePasswordSection').style.display = 'none';
                }, 2000);
            } else {
                messageDiv.innerHTML = `<div class="form-error">✗ ${data.message}</div>`;
                showToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            messageDiv.innerHTML = '<div class="form-error">✗ Failed to change password</div>';
            showToast('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// VIEW: Setup Password
// ========================================
function setupPasswordView() {
    return `
        <div class="card" style="max-width: 500px; margin: 0 auto;">
            <div style="font-size: 64px; text-align: center; margin-bottom: 20px;">🔐</div>
            <div class="card-header">
                <h2 class="card-title">Set Your Password</h2>
                <p class="card-subtitle">Create a strong password to secure your account</p>
            </div>

            <div class="form-success" id="successMessage" style="display: none; margin-bottom: 20px;">
                ✓ Password set successfully! Redirecting to login...
            </div>

            <form id="passwordForm">
                <div class="form-group">
                    <label class="form-label" for="password">Password</label>
                    <div style="position: relative;">
                        <input 
                            type="password" 
                            id="password" 
                            class="form-input" 
                            required
                            minlength="8"
                        >
                        <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 20px; user-select: none;" onclick="togglePasswordField('password')">👁️</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <div style="height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-bottom: 5px;">
                            <div id="strengthFill" style="height: 100%; width: 0%; transition: all 0.3s ease;"></div>
                        </div>
                        <div id="strengthText" style="font-size: 12px; color: #718096;"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="confirmPassword">Confirm Password</label>
                    <div style="position: relative;">
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            class="form-input" 
                            required
                        >
                        <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 20px; user-select: none;" onclick="togglePasswordField('confirmPassword')">👁️</span>
                    </div>
                    <span class="form-error" id="confirmError" style="display: none;">Passwords do not match</span>
                </div>

                <div style="background: #f7fafc; border-radius: 8px; padding: 15px; margin-top: 15px;">
                    <h4 style="font-size: 12px; color: #4a5568; margin-bottom: 10px; font-weight: 600;">Password Requirements:</h4>
                    <div id="req-length" style="font-size: 12px; color: #718096; margin-bottom: 5px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #cbd5e0;">○</span> At least 8 characters
                    </div>
                    <div id="req-uppercase" style="font-size: 12px; color: #718096; margin-bottom: 5px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #cbd5e0;">○</span> One uppercase letter
                    </div>
                    <div id="req-lowercase" style="font-size: 12px; color: #718096; margin-bottom: 5px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #cbd5e0;">○</span> One lowercase letter
                    </div>
                    <div id="req-number" style="font-size: 12px; color: #718096; margin-bottom: 5px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #cbd5e0;">○</span> One number
                    </div>
                    <div id="req-special" style="font-size: 12px; color: #718096; margin-bottom: 5px; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #cbd5e0;">○</span> One special character
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block mt-lg">Set Password</button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--gray-600);">
                Already have an account? 
                <a href="#/login" style="color: var(--primary-600); text-decoration: none; font-weight: 600;" data-link>Login here</a>
            </div>
        </div>
    `;
}

function setupPasswordMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (!token || !email) {
        showToast('Invalid password setup link. Please request a new one.', 'error');
        window.location.hash = '/login';
        return;
    }

    // Password strength checker
    document.getElementById('password').addEventListener('input', function (e) {
        const password = e.target.value;
        checkPasswordStrength(password);
        checkRequirements(password);
    });

    // Confirm password checker
    document.getElementById('confirmPassword').addEventListener('input', function (e) {
        const password = document.getElementById('password').value;
        const confirm = e.target.value;

        const errorEl = document.getElementById('confirmError');
        const confirmField = document.getElementById('confirmPassword');

        if (confirm && password !== confirm) {
            errorEl.style.display = 'block';
            confirmField.classList.add('error');
        } else {
            errorEl.style.display = 'none';
            confirmField.classList.remove('error');
        }
    });

    // Form submission
    const form = document.getElementById('passwordForm');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password.length < 8) {
            showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: decodeURIComponent(email),
                    token: token,
                    password: password,
                    password_confirmation: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('passwordForm').style.display = 'none';
                showToast('Password set successfully!', 'success');

                setTimeout(() => {
                    window.location.hash = '/login';
                }, 2000);
            } else {
                showToast(data.message || 'Failed to set password. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error setting password:', error);
            showToast('Failed to set password. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}

function togglePasswordField(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

function checkPasswordStrength(password) {
    let strength = 0;
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    fill.style.width = '0%';
    fill.style.background = '#e2e8f0';

    if (strength <= 2) {
        fill.style.width = '33%';
        fill.style.background = '#e53e3e';
        text.textContent = 'Weak password';
    } else if (strength <= 4) {
        fill.style.width = '66%';
        fill.style.background = '#f59e0b';
        text.textContent = 'Medium password';
    } else {
        fill.style.width = '100%';
        fill.style.background = '#10b981';
        text.textContent = 'Strong password';
    }
}

function checkRequirements(password) {
    const requirements = {
        'req-length': password.length >= 8,
        'req-uppercase': /[A-Z]/.test(password),
        'req-lowercase': /[a-z]/.test(password),
        'req-number': /[0-9]/.test(password),
        'req-special': /[^a-zA-Z0-9]/.test(password)
    };

    for (const [id, met] of Object.entries(requirements)) {
        const element = document.getElementById(id);
        const span = element.querySelector('span');
        if (met) {
            span.textContent = '✓';
            span.style.color = '#10b981';
        } else {
            span.textContent = '○';
            span.style.color = '#cbd5e0';
        }
    }
}

// ========================================
// ROUTER CONFIGURATION
// ========================================
const routes = [
    {
        path: '/',
        view: homeView
    },
    {
        path: '/register',
        view: registerView,
        onMount: registerMount
    },
    {
        path: '/verification-success',
        view: verificationSuccessView
    },
    {
        path: '/create-account',
        view: createAccountView,
        onMount: createAccountMount
    },
    {
        path: '/login',
        view: loginView,
        onMount: loginMount
    },
    {
        path: '/dashboard',
        view: enhancedDashboardView,
        onMount: enhancedDashboardMount
    },
    {
        path: '/multi-step-register',
        view: multiStepRegisterView,
        onMount: multiStepRegisterMount
    },
    {
        path: '/setup-password',
        view: setupPasswordView,
        onMount: setupPasswordMount
    },
    {
        path: '*',
        view: () => `
            <div class="card" style="max-width: 500px; margin: 0 auto; text-align: center;">
                <h1 style="font-size: 4rem; color: var(--primary-600);">404</h1>
                <h2 class="card-title">Page Not Found</h2>
                <p class="card-subtitle">The page you're looking for doesn't exist</p>
                <a href="#/" class="btn btn-primary mt-lg" data-link>Go Home</a>
            </div>
        `
    }
];

// Initialize router
const router = new SPARouter(routes);

// Check for verification token in URL (from email link redirect)
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token && !window.location.hash.includes('verification-success')) {
        window.location.hash = '/verification-success';
    }
});
