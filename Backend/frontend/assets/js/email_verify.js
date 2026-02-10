
/**
 * Validate email format using a simple regex
 */
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}


// Using API base URL from config file
const API_BASE_URL = CONFIG.API_BASE_URL;

/**
 * Get required DOM elements
 */
const form = document.getElementById('registerForm');
const messageEl = document.getElementById('message');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submitBtn');
const loadingEl = document.getElementById('loading');

/**
 * Handle form submit
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = emailInput.value.trim(); // Get trimmed email value

    // Check if email is empty
    if (!email) {
        showMessage('Please enter an email address.', 'error');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    // Disable submit button and show loading indicator
    submitBtn.disabled = true;
    loadingEl.classList.add('show');

    try {
        // Build API endpoint URL
        const endpoint = `${API_BASE_URL}/api/pre-register/send-link`;
        console.log('Sending request to:', endpoint);

        // Send POST request to backend
        const res = await fetch(endpoint, {   
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email }) // Send email in request body
        });

        // Parse JSON response
        const data = await res.json();
        console.log('Response:', res.status, data);

        // If request was successful
        if (res.ok) {
            // Redirect to verification page with email in query string
            window.location.href = `email_verification_link.html?email=${encodeURIComponent(email)}`;

            // Clear email input
            emailInput.value = '';
        } 
        // If backend returned an error
        else {
            const errorMessage = data.message || 'Something went wrong. Please try again.';
            showMessage(errorMessage, 'error');

            // Optional: redirect to failed page
            // window.location.href =
            //   `verification_failed.html?email=${encodeURIComponent(email)}&reason=${encodeURIComponent(errorMessage)}`;
        }

    } catch (err) {
        // Network or fetch error
        console.error('Network error:', err);
        showMessage(
            'Network error. Please check your connection and try again.',
            'error'
        );
    } finally {
        // Re-enable submit button and hide loading indicator
        submitBtn.disabled = false;
        loadingEl.classList.remove('show');
    }
});

/**
 * Show a message to the user with styling
 */
function showMessage(text, type) {
    messageEl.textContent = text;                // Set message text
    messageEl.classList.remove('success', 'error'); // Remove old styles
    messageEl.classList.add(type, 'show');       // Add new style
}
