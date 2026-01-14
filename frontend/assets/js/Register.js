
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//configuration - UPDATE THIS WITH YOUR ACTUAL DOMAIN
const API_BASE_URL = 'http://127.0.0.1:8000'; // Change to your live domain
// For local testing: const API_BASE_URL = 'http://127.0.0.1:8000';

const form = document.getElementById('registerForm');
const messageEl = document.getElementById('message');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const loadingEl = document.getElementById('loading');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email format
    if (!email) {
        showMessage('Please enter an email address.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    // Optional: reCAPTCHA validation
    // const recaptchaResponse = grecaptcha.getResponse();
    // if (!recaptchaResponse) {
    //     showMessage('Please complete the CAPTCHA.', 'error');
    //     return;
    // }

    // Disable submit button and show loading
    submitBtn.disabled = true;
    loadingEl.classList.add('show');

    try {
        const endpoint = `${API_BASE_URL}/api/pre-register/send-link`;
        
        console.log('Sending request to:', endpoint); // Debug log
        
        // Get CSRF token from meta tag
        //const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

       const res = await fetch("http://127.0.0.1:8000/api/pre-register/send-link", {
                      method: 'POST',
                      headers: { 
                               'Content-Type': 'application/json',
                                'Accept': 'application/json'
                                },
                      body: JSON.stringify({ email })
                   });

        const data = await res.json();

        if (res.ok) {

            // Redirect immediately to confirmation page with email in query string
            window.location.href = `Verification_link.html?email=${encodeURIComponent(email)}`;
            //showMessage(
               // 'Success! Check your email for the verification link. It expires in 15 minutes.',
               // 'success'
           // );
            emailInput.value = ''; // Clear email input
        } else {
            // Handle specific error messages from backend
            const errorMessage = data.message || 'Something went wrong. Please try again.';
            showMessage(errorMessage, 'error');
        }

    } catch (err) {
        console.error('Network error:', err);
        showMessage(
            'Network error. Please check your connection and try again.',
            'error'
        );
    } finally {
        // Re-enable submit button and hide loading
        submitBtn.disabled = false;
        loadingEl.classList.remove('show');
    }
});

/**
 * For local development, log the API URL being used
 */
console.log('API Base URL:', API_BASE_URL);

console.log(form);


/**
 * Show message with styling
 */
function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.classList.remove('success', 'error');
    messageEl.classList.add(type, 'show');
}


