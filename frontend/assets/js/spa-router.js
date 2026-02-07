/**
 * SPA Router
 * Handles client-side routing without page reloads
 */

class SPARouter {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        // Listen for link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                window.location.hash = href.replace('#', '');
            }
        });

        // Handle initial load
        this.handleRoute();
    }

    /**
     * Get current route from hash
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1) || '/';
        return hash.split('?')[0];
    }

    /**
     * Navigate to a route
     */
    navigate(path) {
        window.location.hash = path;
    }

    /**
     * Handle route change
     */
    async handleRoute() {
        const path = this.getCurrentPath();

        // Find matching route
        let route = this.routes.find(r => {
            if (r.path === path) return true;

            // Check for dynamic routes (e.g., /user/:id)
            const routeParts = r.path.split('/');
            const pathParts = path.split('/');

            if (routeParts.length !== pathParts.length) return false;

            return routeParts.every((part, i) => {
                return part.startsWith(':') || part === pathParts[i];
            });
        });

        // Default to 404 if no route found
        if (!route) {
            route = this.routes.find(r => r.path === '*') || {
                path: '*',
                view: () => '<h1>404 - Page Not Found</h1>'
            };
        }

        // Extract params from dynamic routes
        const params = {};
        if (route.path.includes(':')) {
            const routeParts = route.path.split('/');
            const pathParts = path.split('/');
            routeParts.forEach((part, i) => {
                if (part.startsWith(':')) {
                    params[part.slice(1)] = pathParts[i];
                }
            });
        }

        // Store current route
        this.currentRoute = { ...route, params, path };

        // Update active nav links
        this.updateActiveLinks(path);

        // Update navbar based on auth status
        this.updateNavbar();

        // Render the view
        await this.renderView(route, params);
    }

    /**
     * Update navbar based on auth status
     */
    updateNavbar() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const authToken = sessionStorage.getItem('authToken');

        if (authToken) {
            // Logged in: Hide Home, Login, Register. Show Dashboard and Logout.
            navLinks.innerHTML = `
                <a href="#/dashboard" class="nav-link" data-link>Dashboard</a>
                <a href="#" id="navLogoutBtn" class="nav-link">Logout</a>
            `;

            // Setup nav logout
            const navLogoutBtn = document.getElementById('navLogoutBtn');
            if (navLogoutBtn) {
                navLogoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();

                    try {
                        // Import config if not available
                        const apiBaseUrl = typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : '';

                        await fetch(`${apiBaseUrl}/api/auth/logout`, {
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
                    if (typeof showToast === 'function') showToast('Logged out successfully', 'success');
                    window.location.hash = '/login';
                    this.updateNavbar();
                });
            }
        } else {
            // Not logged in: Show Home, Login, Register
            navLinks.innerHTML = `
                <a href="#/" class="nav-link" data-link>Home</a>
                <a href="#/login" class="nav-link" data-link>Login</a>
                <a href="#/multi-step-register" class="nav-link" data-link>Register</a>
            `;
        }
    }

    /**
     * Update active navigation links
     */
    updateActiveLinks(currentPath) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Render view with transition
     */
    async renderView(route, params) {
        const content = document.getElementById('content');

        // Add exit animation
        content.classList.add('page-exit');

        // Wait for exit animation
        await new Promise(resolve => setTimeout(resolve, 150));

        // Get view content
        let html;
        if (typeof route.view === 'function') {
            html = await route.view(params);
        } else {
            html = route.view;
        }

        // Update content
        content.innerHTML = html;

        // Remove exit class and add enter class
        content.classList.remove('page-exit');
        content.classList.add('page-enter');

        // Trigger enter animation
        requestAnimationFrame(() => {
            content.classList.add('page-enter-active');
        });

        // Clean up animation classes
        setTimeout(() => {
            content.classList.remove('page-enter', 'page-enter-active');
        }, 350);

        // Call onMount if defined
        if (route.onMount) {
            route.onMount(params);
        }
    }

    /**
     * Get query parameters
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
}

/**
 * Utility: Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
        error: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        warning: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
        info: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };

    toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Utility: Create loading spinner
 */
function createSpinner() {
    return '<div class="loading-screen"><div class="spinner"></div></div>';
}

/**
 * Export router class and utilities
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SPARouter, showToast, createSpinner };
}
