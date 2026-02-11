/**
 * Global configuration file
 * Change values here when moving to production
 */
const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8001' // Local Laravel API
    // Production example:
    // API_BASE_URL: 'https://api.yourdomain.com'
};

// Global Fetch Interceptor for Session Management
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    // Add credentials: 'include' to all requests if not already specified
    if (args[1] && typeof args[1] === 'object') {
        if (!args[1].credentials) {
            args[1].credentials = 'include';
        }
    } else if (!args[1]) {
        args[1] = { credentials: 'include' };
    }

    try {
        const response = await originalFetch(...args);

        if (response.status === 401) {
            // Session expired or unauthorized
            sessionStorage.clear();
            localStorage.removeItem('registrationData'); // Clear any registration data

            if (window.location.hash !== '#/login' && window.location.hash !== '#/multi-step-register') {
                window.location.hash = '/login';
                // Use toastr if available, otherwise alert or silent
                if (typeof toastr !== 'undefined') {
                    toastr.warning('Session expired. Please login again.');
                }
            }
        }

        return response;
    } catch (error) {
        throw error;
    }
};
