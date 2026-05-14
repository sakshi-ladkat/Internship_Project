import { isLoggedIn } from '../utils/auth.js';

import { renderHome } from '../pages/home.js';
import { renderLogin } from '../pages/Authentication/login.js';
import { renderOtpPage } from '../pages/Authentication/otp.js';
import { renderDashboard } from '../pages/Dashboard/dashboard.js';
import { RegistrationView, initRegistration } from '../pages/Registration/registration.js';
import { renderAdminDashboard } from '../pages/AdminDashboard/adminDashboard.js';

export function router() {
  const app = document.getElementById('app');
  if (!app) return;

  const fullHash = window.location.hash || '#/';
  const [baseHash, queryStr] = fullHash.split('?');

  if (!window.location.hash) {
    window.location.hash = '#/';
    return;
  }

  if ((baseHash === '#/dashboard' || baseHash === '#/dashboard-profile' || baseHash === '#/admin') && !isLoggedIn()) {
    window.location.hash = '#/login';
    return;
  }

  const userStatus = localStorage.getItem('user_status');
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  const isSuperAdmin = userRoles.includes('super_admin');

  if ((baseHash === '#/login' || baseHash === '#/otp') && isLoggedIn()) {
    if (userStatus === 'onboarding') {
      window.location.hash = '#/registration';
    } else {
      window.location.hash = isSuperAdmin ? '#/admin' : '#/dashboard';
    }
    return;
  }

  if ((baseHash === '#/dashboard' || baseHash === '#/dashboard-profile') && isLoggedIn()) {
    if (userStatus === 'onboarding') {
      window.location.hash = '#/registration';
      return;
    }
    if (isSuperAdmin && baseHash !== '#/dashboard-profile') {
      window.location.hash = '#/admin';
      return;
    }
  }

  if (baseHash === '#/registration') {
    if (!isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }
    // Allow reupload_required/edit mode to access registration even if already "filled"
    const isEditMode = queryStr && queryStr.includes('mode=edit');
    if (!isEditMode && (userStatus === 'filled' || userStatus === 'completed' || userStatus === 'active')) {
      window.location.hash = isSuperAdmin ? '#/admin' : '#/dashboard';
      return;
    }
  }

  app.innerHTML = '';

  switch (baseHash) {
    case '#/':
      renderHome(app);
      break;

    case '#/login':
      renderLogin(app);
      break;

    case '#/otp':
      renderOtpPage();
      break;

    case '#/dashboard':
    case '#/dashboard-profile':
      renderDashboard(app, baseHash === '#/dashboard-profile');
      break;

    case '#/registration':
      app.innerHTML = RegistrationView();
      initRegistration();
      break;

    case '#/admin':
      renderAdminDashboard(app);
      break;

    default:
      app.innerHTML = `<div style="padding: 40px; text-align:center;"><h1>404 - Page Not Found</h1><p>Route: ${escHtml(baseHash)}</p><a href="#/">Back to Home</a></div>`;
  }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}