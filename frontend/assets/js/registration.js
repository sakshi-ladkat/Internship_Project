// Registration JavaScript
let registrationCurrentStep = 1;
const totalSteps = 5;
let verificationToken = null;
let verifiedEmail = null;

// Session storage keys
const STORAGE_KEY = 'registration_form_data';
const STORAGE_STEP_KEY = 'registration_current_step';
const STORAGE_TOKEN_KEY = 'registration_verification_token';
const STORAGE_EMAIL_KEY = 'registration_verified_email';


// Save form data to sessionStorage
function saveFormData() {
    const formData = {
        institute_id: document.getElementById('institute')?.value || '',
        first_name: document.getElementById('firstName')?.value || '',
        middle_name: document.getElementById('middleName')?.value || '',
        last_name: document.getElementById('lastName')?.value || '',
        suffix: document.getElementById('suffix')?.value || '',
        email: document.getElementById('email')?.value || '',
        address_line1: document.getElementById('addressLine1')?.value || '',
        address_line2: document.getElementById('addressLine2')?.value || '',
        address_line3: document.getElementById('addressLine3')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        postal_code: document.getElementById('postalCode')?.value || '',
        continent: document.getElementById('continent')?.value || '',
        country: document.getElementById('country')?.value || '',
        office_country_code: document.getElementById('officeCountryCode')?.value || '',
        office_city_code: document.getElementById('officeCityCode')?.value || '',
        office_number: document.getElementById('officeNumber')?.value || '',
        fax_number: document.getElementById('faxNumber')?.value || '',
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    sessionStorage.setItem(STORAGE_STEP_KEY, registrationCurrentStep.toString());

    if (verificationToken) {
        sessionStorage.setItem(STORAGE_TOKEN_KEY, verificationToken);
    }
    if (verifiedEmail) {
        sessionStorage.setItem(STORAGE_EMAIL_KEY, verifiedEmail);
    }
}

// Restore form data from sessionStorage
function restoreFormData(skipStepRestore = false) {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    const savedStep = sessionStorage.getItem(STORAGE_STEP_KEY);
    const savedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);
    const savedEmail = sessionStorage.getItem(STORAGE_EMAIL_KEY);

    if (savedToken && savedEmail) {
        verificationToken = savedToken;
        verifiedEmail = savedEmail;
    }

    if (savedData) {
        try {
            const formData = JSON.parse(savedData);

            // Restore all form fields
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(getFieldId(key));
                if (element && formData[key]) {
                    element.value = formData[key];

                    // Trigger change event for dropdowns to handle dependent logic
                    if (element.tagName === 'SELECT' && element.id !== 'continent') {
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });

            // If continent is selected, load countries
            if (formData.continent) {
                const continentSelect = document.getElementById('continent');
                if (continentSelect) {
                    continentSelect.value = formData.continent;
                    // Trigger loadCountries
                    setTimeout(async () => {
                        await loadCountries();
                        // Restore country after options are loaded
                        const countrySelect = document.getElementById('country');
                        if (countrySelect && formData.country) {
                            countrySelect.value = formData.country;
                        }
                    }, 100);
                }
            }
        } catch (e) {
            console.error('Error restoring form data:', e);
        }
    }

    // Restore step if saved (but don't override URL params navigation)

    if (!skipStepRestore && savedStep && !window.location.hash.includes('token=') && !window.location.hash.includes('email=')) {
        const step = parseInt(savedStep);
        if (step > 1 && step <= totalSteps) {
            setTimeout(() => goToStep(step), 200);
        }
    }
}

// Helper function to map data keys to field IDs
function getFieldId(key) {
    const mapping = {
        'institute_id': 'institute',
        'first_name': 'firstName',
        'middle_name': 'middleName',
        'last_name': 'lastName',
        'suffix': 'suffix',
        'email': 'email',
        'address_line1': 'addressLine1',
        'address_line2': 'addressLine2',
        'address_line3': 'addressLine3',
        'city': 'city',
        'state': 'state',
        'postal_code': 'postalCode',
        'continent': 'continent',
        'country': 'country',
        'office_country_code': 'officeCountryCode',
        'office_city_code': 'officeCityCode',
        'office_number': 'officeNumber',
        'fax_number': 'faxNumber',
    };
    return mapping[key] || key;
}

// Clear saved registration data
function clearRegistrationData() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP_KEY);
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_EMAIL_KEY);
}

// Check URL parameters for email verification
function checkURLParams() {
    // Check standard search params
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');
    let email = urlParams.get('email');

    // If not found, check hash params (common in SPAs with hash routing)
    if (!token && window.location.hash.includes('?')) {
        try {
            const hashQueryString = window.location.hash.split('?')[1];
            const hashParams = new URLSearchParams(hashQueryString);
            token = hashParams.get('token');
            email = hashParams.get('email');
        } catch (e) {
            console.error('Error parsing hash params:', e);
        }
    }

    if (token && email) {
        console.log('Verification successful via params.');
        verificationToken = token;
        verifiedEmail = decodeURIComponent(email);

        // Save to sessionStorage
        sessionStorage.setItem(STORAGE_TOKEN_KEY, verificationToken);
        sessionStorage.setItem(STORAGE_EMAIL_KEY, verifiedEmail);

        // Restore form data first (skip step restore since we'll navigate to step 3)
        restoreFormData(true);

        // Mark email as verified and lock fields
        const emailInput = document.getElementById('email');
        const verifiedEmailInput = document.getElementById('verifiedEmail');
        const emailVerifiedDiv = document.getElementById('emailVerified');
        const emailNotVerifiedDiv = document.getElementById('emailNotVerified');
        const nextBtn = document.getElementById('emailNextBtn');

        if (emailInput) {
            emailInput.value = verifiedEmail;
            emailInput.readOnly = true;
        }

        if (verifiedEmailInput) {
            verifiedEmailInput.value = verifiedEmail;
            verifiedEmailInput.readOnly = true;
        }

        if (emailNotVerifiedDiv) emailNotVerifiedDiv.style.display = 'none';
        if (emailVerifiedDiv) emailVerifiedDiv.style.display = 'block';
        if (nextBtn) nextBtn.disabled = false;

        // Show success message
        if (typeof toastr !== 'undefined') {
            toastr.success('Email verified successfully!');
        }

        // Navigate to Step 3
        goToStep(3);
    } else {
        // No email verification in URL, just restore form data normally
        restoreFormData();
    }
}

// Load institutes from API
async function loadInstitutes() {
    console.log('loadInstitutes() called');
    console.log('API_BASE_URL:', CONFIG.API_BASE_URL);

    const select = document.getElementById('institute');
    if (!select) {
        console.error('Institute select element not found in DOM!');
        return;
    }

    try {
        const url = `${CONFIG.API_BASE_URL}/api/institutes`;
        console.log('Fetching institutes from:', url);

        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Institutes data received:', data);
        console.log('Number of institutes:', data.institutes?.length);

        select.innerHTML = '<option value="">-- Select Institute --</option>';

        if (!data.institutes || data.institutes.length === 0) {
            console.warn('No institutes found in response');
            showError('No institutes available. Please contact support.');
            return;
        }

        data.institutes.forEach(institute => {
            const option = document.createElement('option');
            option.value = institute.id;
            option.textContent = `${institute.name} (${institute.city}, ${institute.country})`;
            select.appendChild(option);
        });

        console.log('Successfully populated', data.institutes.length, 'institutes');

        // After institutes are loaded, restore the selected value from sessionStorage
        const savedData = sessionStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                if (formData.institute_id) {
                    select.value = formData.institute_id;
                    console.log('Restored institute selection:', formData.institute_id);
                }
            } catch (e) {
                console.error('Error restoring institute:', e);
            }
        }
    } catch (error) {
        console.error('Error loading institutes:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        showError('Failed to load institutes. Please refresh the page.');

        // Show a more helpful error message
        if (typeof toastr !== 'undefined') {
            toastr.error(`Failed to load institutes: ${error.message}`, 'Network Error', {
                timeOut: 10000
            });
        }
    }
}

// Load continents
async function loadContinents() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/locations/continents`);
        const data = await response.json();

        const select = document.getElementById('continent');
        select.innerHTML = '<option value="">-- Select Continent --</option>';

        data.continents.forEach(continent => {
            const option = document.createElement('option');
            option.value = continent.name;
            option.textContent = continent.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading continents:', error);
    }
}

// Load countries based on continent
async function loadCountries() {
    const continent = document.getElementById('continent').value;
    const countrySelect = document.getElementById('country');

    if (!continent) {
        countrySelect.innerHTML = '<option value="">-- Select Continent First --</option>';
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/locations/countries-by-name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ continent })
        });

        const data = await response.json();

        countrySelect.innerHTML = '<option value="">-- Select Country --</option>';
        data.countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

// Send verification email
async function sendVerificationEmail() {
    const email = document.getElementById('email').value;

    if (!email || !validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            toastr.success('Verification email sent! Please check your inbox.');
        } else {
            // Check for pending registration
            if (data.message && (data.message.toLowerCase().includes('pending') || data.message.toLowerCase().includes('already exists'))) {
                toastr.warning(
                    `<div>${data.message}</div><div style="margin-top:10px;"><button class="btn-sm btn-light" onclick="resendVerification('${email}')">Resend Link & Continue</button></div>`,
                    'Pending Registration',
                    { timeOut: 0, extendedTimeOut: 0 }
                );
            } else {
                toastr.error(data.message || 'Failed to send verification email');
            }
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        toastr.error('Failed to send verification email. Please try again.');
    }
}

// Resend verification for pending registration
async function resendVerification(email) {
    if (!email) return;

    // Use the same endpoint or a specific resend endpoint if available
    // Assuming the same endpoint handles resending logic or we can trigger it
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            toastr.clear(); // Clear the warning toast
            toastr.success('Verification link sent again. Please check your email to continue.');
        } else {
            // Fallback to standard send if resend endpoint doesn't exist
            const retryResponse = await fetch(`${CONFIG.API_BASE_URL}/api/registration/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (retryResponse.ok) {
                toastr.clear();
                toastr.success('Verification link sent again. Please check your email to continue.');
            } else {
                toastr.error('Could not resend verification email.');
            }
        }
    } catch (e) {
        toastr.error('Network error. Please try again.');
    }
}

// Submit registration
async function submitRegistration() {
    if (!validateStep(4)) {
        return;
    }

    if (!verificationToken || !verifiedEmail) {
        toastr.error('Email verification required. Please verify your email first.');
        goToStep(3); // Navigate to email verification step
        return;
    }

    // Get saved data from sessionStorage as fallback
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    let savedFormData = {};
    if (savedData) {
        try {
            savedFormData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error parsing saved form data:', e);
        }
    }

    // Helper function to get value with fallback to sessionStorage
    const getFieldValue = (fieldId, storageKey) => {
        const element = document.getElementById(fieldId);
        const value = element?.value || '';
        return value || savedFormData[storageKey] || '';
    };

    const formData = {
        token: verificationToken,
        email: verifiedEmail,
        institute_id: getFieldValue('institute', 'institute_id'),
        first_name: getFieldValue('firstName', 'first_name'),
        middle_name: getFieldValue('middleName', 'middle_name'),
        last_name: getFieldValue('lastName', 'last_name'),
        suffix: getFieldValue('suffix', 'suffix'),
        address_line1: getFieldValue('addressLine1', 'address_line1'),
        address_line2: getFieldValue('addressLine2', 'address_line2'),
        address_line3: getFieldValue('addressLine3', 'address_line3'),
        city: getFieldValue('city', 'city'),
        state: getFieldValue('state', 'state'),
        postal_code: getFieldValue('postalCode', 'postal_code'),
        continent: getFieldValue('continent', 'continent'),
        country: getFieldValue('country', 'country'),
        office_country_code: getFieldValue('officeCountryCode', 'office_country_code'),
        office_city_code: getFieldValue('officeCityCode', 'office_city_code'),
        office_number: getFieldValue('officeNumber', 'office_number'),
        fax_number: getFieldValue('faxNumber', 'fax_number'),
    };

    console.log('Submitting registration with data:', formData);

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/save-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            toastr.success('Registration successful!');

            // Clear saved registration data
            clearRegistrationData();

            // Generate Summary
            const summaryTypes = {
                first_name: 'Name',
                email: 'Email',
                city: 'City',
                country: 'Country'
            };

            let summaryHtml = '<h3 style="margin-bottom: 10px; color: #475569;">Submission Summary</h3>';
            summaryHtml += `<p style="margin-bottom: 5px;"><strong>Name:</strong> ${formData.first_name} ${formData.last_name}</p>`;
            summaryHtml += `<p style="margin-bottom: 5px;"><strong>Email:</strong> ${formData.email}</p>`;
            summaryHtml += `<p style="margin-bottom: 5px;"><strong>Location:</strong> ${formData.city}, ${formData.country}</p>`;

            const summaryEl = document.getElementById('registrationSummary');
            if (summaryEl) {
                summaryEl.innerHTML = summaryHtml;
                summaryEl.style.display = 'block';
            }

            nextStep(); // Go to success step
        } else {
            console.error('Registration error:', data);
            let errorMessage = data.message || 'Registration failed. Please try again.';

            // Append validation errors if available
            if (data.errors) {
                const validationErrors = Object.values(data.errors).flat().join('\n');
                errorMessage += '\n' + validationErrors;
            }

            toastr.error(errorMessage, 'Registration Failed', { timeOut: 10000 });
        }
    } catch (error) {
        console.error('Error submitting registration:', error);
        toastr.error('Registration failed. Please try again.');
    }
}

// Navigation functions
function nextStep() {
    if (!validateStep(registrationCurrentStep)) {
        return;
    }

    // Save form data before moving to next step
    saveFormData();

    if (registrationCurrentStep < totalSteps) {
        goToStep(registrationCurrentStep + 1);
    }
}

function prevStep() {
    // Save form data before moving to previous step
    saveFormData();

    if (registrationCurrentStep > 1) {
        goToStep(registrationCurrentStep - 1);
    }
}

function goToStep(step) {
    // Hide current step
    const currentStepEl = document.querySelector(`.step-content[data-step="${registrationCurrentStep}"]`);
    const currentProgressEl = document.querySelector(`.progress-step[data-step="${registrationCurrentStep}"]`);

    if (currentStepEl) currentStepEl.classList.remove('active');
    if (currentProgressEl) currentProgressEl.classList.remove('active');

    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        const prevProgressEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (prevProgressEl) prevProgressEl.classList.add('completed');
    }

    // Show new step
    registrationCurrentStep = step;
    const newStepEl = document.querySelector(`.step-content[data-step="${registrationCurrentStep}"]`);
    const newProgressEl = document.querySelector(`.progress-step[data-step="${registrationCurrentStep}"]`);

    if (newStepEl) newStepEl.classList.add('active');
    if (newProgressEl) newProgressEl.classList.add('active');

    // Save current step to sessionStorage
    sessionStorage.setItem(STORAGE_STEP_KEY, registrationCurrentStep.toString());

    // Scroll to top
    window.scrollTo(0, 0);
}

// Validation functions
function validateStep(step) {
    let isValid = true;

    switch (step) {
        case 1:
            isValid = validateField('institute', 'Please select an institute');
            break;
        case 2:
            isValid = validateField('firstName', 'First name is required') &&
                validateField('lastName', 'Last name is required');
            break;
        case 3:
            if (!verificationToken || !verifiedEmail) {
                toastr.error('Please verify your email before proceeding');
                isValid = false;
            }
            break;
        case 4:
            isValid = validateField('addressLine1', 'Address is required') &&
                validateField('city', 'City is required') &&
                validateField('state', 'State is required') &&
                validateField('postalCode', 'Postal code is required') &&
                validateField('continent', 'Please select a continent') &&
                validateField('country', 'Please select a country') &&
                validateField('officeCountryCode', 'Country code is required') &&
                validateField('officeNumber', 'Office number is required');
            break;
    }

    return isValid;
}

function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return true; // Skip if field doesn't exist (e.g. not on step)

    const value = field.value.trim();

    if (!value) {
        showFieldError(fieldId, errorMessage);
        return false;
    }

    hideFieldError(fieldId);
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;

    field.classList.add('error');
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    } else {
        // Use Toastr if inline error element is missing
        toastr.error(message);
    }
}

function hideFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;

    field.classList.remove('error');
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.classList.remove('show');
    }
}

function showError(message) {
    toastr.error(message);
}

// Debounce function for auto-save
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-save form data with debounce
const autoSaveFormData = debounce(() => {
    saveFormData();
}, 500);

// Initialize event listeners for auto-save
function initializeAutoSave() {
    const formFields = [
        'institute', 'firstName', 'middleName', 'lastName', 'suffix',
        'email', 'addressLine1', 'addressLine2', 'addressLine3',
        'city', 'state', 'postalCode', 'continent', 'country',
        'officeCountryCode', 'officeCityCode', 'officeNumber', 'faxNumber'
    ];

    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', autoSaveFormData);
            field.addEventListener('change', autoSaveFormData);
        }
    });
}

// Initialize auto-save when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoSave);
} else {
    // DOM is already ready, initialize immediately
    setTimeout(initializeAutoSave, 100);
}

// Expose functions to window object for SPA access
window.loadInstitutes = loadInstitutes;
window.loadContinents = loadContinents;
window.loadCountries = loadCountries;
window.checkURLParams = checkURLParams;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.sendVerificationEmail = sendVerificationEmail;
window.resendVerification = resendVerification;
window.submitRegistration = submitRegistration;
window.initializeAutoSave = initializeAutoSave;
