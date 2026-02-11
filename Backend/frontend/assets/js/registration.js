// Registration JavaScript
let registrationCurrentStep = 1;
const totalSteps = 5;
let verificationToken = null;
let verifiedEmail = null;


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
    }
}

// Draft Management Functions
let draftToken = localStorage.getItem('registrationDraftToken');
let autoSaveTimeout = null;

// Auto-save draft data
function autoSaveDraft() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        await saveDraft();
    }, 2000); // Save 2 seconds after user stops typing
}

// Save draft to Redis
async function saveDraft() {
    try {
        const formData = collectFormData();

        // Don't save if no data entered yet
        if (!formData.institute_id && !formData.first_name) {
            return;
        }

        const payload = {
            ...formData,
            draftToken: draftToken || undefined,
            currentStep: registrationCurrentStep
        };

        const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/save-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            draftToken = data.draftToken;
            localStorage.setItem('registrationDraftToken', draftToken);
            console.log('Draft saved:', data.draftToken);

            // Show subtle save indicator
            showSaveIndicator();
        }
    } catch (error) {
        console.error('Error saving draft:', error);
    }
}

// Load draft from Redis
async function loadDraft() {
    const token = localStorage.getItem('registrationDraftToken');

    console.log('loadDraft called, token:', token);

    if (!token) {
        console.log('No draft token found in localStorage');
        return;
    }

    try {
        console.log('Fetching draft from API...');
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/registration/get-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        console.log('Draft API response status:', response.status);
        const data = await response.json();
        console.log('Draft API response data:', data);

        if (response.ok && data.draft) {
            console.log('Draft loaded successfully:', data.draft);
            populateFormFromDraft(data.draft);

            // Show notification
            if (typeof toastr !== 'undefined') {
                toastr.info('Your previous progress has been restored');
            }
        } else if (response.status === 404 || response.status === 410) {
            // Draft expired or not found
            console.warn('Draft not found or expired, clearing token');
            localStorage.removeItem('registrationDraftToken');
            draftToken = null;
        } else {
            console.warn('Unexpected response:', response.status, data);
        }
    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

// Delete draft after successful registration
async function deleteDraft() {
    const token = localStorage.getItem('registrationDraftToken');

    if (!token) {
        return;
    }

    try {
        await fetch(`${CONFIG.API_BASE_URL}/api/registration/delete-draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        localStorage.removeItem('registrationDraftToken');
        draftToken = null;
    } catch (error) {
        console.error('Error deleting draft:', error);
    }
}

// Collect all form data
function collectFormData() {
    return {
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
}


// Populate form from draft data
function populateFormFromDraft(draft) {
    console.log('Populating form from draft:', draft);

    const fieldMap = {
        institute_id: 'institute',
        first_name: 'firstName',
        middle_name: 'middleName',
        last_name: 'lastName',
        suffix: 'suffix',
        email: 'email',
        address_line1: 'addressLine1',
        address_line2: 'addressLine2',
        address_line3: 'addressLine3',
        city: 'city',
        state: 'state',
        postal_code: 'postalCode',
        continent: 'continent',
        country: 'country',
        office_country_code: 'officeCountryCode',
        office_city_code: 'officeCityCode',
        office_number: 'officeNumber',
        fax_number: 'faxNumber',
    };

    let fieldsPopulated = 0;
    Object.keys(fieldMap).forEach(key => {
        const elementId = fieldMap[key];
        const element = document.getElementById(elementId);

        if (element && draft[key]) {
            element.value = draft[key];
            fieldsPopulated++;
            console.log(`Populated ${elementId} with value:`, draft[key]);
        } else if (!element) {
            console.warn(`Element not found: ${elementId}`);
        }
    });

    console.log(`Total fields populated: ${fieldsPopulated}`);

    // If continent is set, load countries
    if (draft.continent) {
        console.log('Loading countries for continent:', draft.continent);
        setTimeout(() => {
            loadCountries();
        }, 500);
    }

    // Restore to saved step if available
    if (draft.currentStep && draft.currentStep > 1) {
        console.log('Restoring to step:', draft.currentStep);
        // Don't restore to email verification step or beyond if email not verified
        if (!verificationToken && draft.currentStep >= 3) {
            console.log('Email not verified, going to step 2');
            goToStep(2); // Go to personal info step
        } else {
            goToStep(draft.currentStep);
        }
    }
}

// Show save indicator
function showSaveIndicator() {
    // Create or update save indicator
    let indicator = document.getElementById('saveIndicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        indicator.textContent = '✓ Draft saved';
        document.body.appendChild(indicator);
    }

    // Show indicator
    indicator.style.opacity = '1';

    // Hide after 2 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Setup auto-save listeners
function setupAutoSave() {
    console.log('setupAutoSave called');

    // Try both possible IDs
    let form = document.getElementById('registrationForm');
    if (!form) {
        form = document.getElementById('registrationFormWrapper');
    }

    if (!form) {
        console.warn('Registration form not found, trying to find by class or tag');
        // Try to find the form container
        form = document.querySelector('.form-container');
    }

    if (form) {
        console.log('Form found, attaching event listeners');
        // Add input event listeners to all form fields
        const inputs = form.querySelectorAll('input, select');
        console.log(`Found ${inputs.length} input/select elements`);

        inputs.forEach((input, index) => {
            input.addEventListener('input', autoSaveDraft);
            input.addEventListener('change', autoSaveDraft);
        });

        console.log('Auto-save listeners attached successfully');
    } else {
        console.error('Could not find registration form element');
    }
}

// Load institutes from API
async function loadInstitutes() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/institutes`);
        const data = await response.json();

        const select = document.getElementById('institute');
        select.innerHTML = '<option value="">-- Select Institute --</option>';

        data.institutes.forEach(institute => {
            const option = document.createElement('option');
            option.value = institute.id;
            option.textContent = `${institute.name} (${institute.city}, ${institute.country})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading institutes:', error);
        showError('Failed to load institutes. Please refresh the page.');
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
            toastr.error(data.message || 'Failed to send verification email');
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        toastr.error('Failed to send verification email. Please try again.');
    }
}

// Submit registration
async function submitRegistration() {
    if (!validateStep(4)) {
        return;
    }

    if (!verificationToken || !verifiedEmail) {
        toastr.error('Email verification required. Please verify your email first.');
        return;
    }

    const formData = {
        token: verificationToken,
        email: verifiedEmail,
        institute_id: document.getElementById('institute').value,
        first_name: document.getElementById('firstName').value,
        middle_name: document.getElementById('middleName').value,
        last_name: document.getElementById('lastName').value,
        suffix: document.getElementById('suffix').value,
        address_line1: document.getElementById('addressLine1').value,
        address_line2: document.getElementById('addressLine2').value,
        address_line3: document.getElementById('addressLine3').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        postal_code: document.getElementById('postalCode').value,
        continent: document.getElementById('continent').value,
        country: document.getElementById('country').value,
        office_country_code: document.getElementById('officeCountryCode').value,
        office_city_code: document.getElementById('officeCityCode').value,
        office_number: document.getElementById('officeNumber').value,
        fax_number: document.getElementById('faxNumber').value,
    };

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

            // Delete draft after successful registration
            await deleteDraft();

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

    if (registrationCurrentStep < totalSteps) {
        goToStep(registrationCurrentStep + 1);
    }
}

function prevStep() {
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

// Expose functions to window object for SPA access
window.loadInstitutes = loadInstitutes;
window.loadContinents = loadContinents;
window.loadCountries = loadCountries;
window.checkURLParams = checkURLParams;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.sendVerificationEmail = sendVerificationEmail;
window.submitRegistration = submitRegistration;
window.loadDraft = loadDraft;
window.saveDraft = saveDraft;
window.deleteDraft = deleteDraft;
window.setupAutoSave = setupAutoSave;

// Note: Initialization is handled by multiStepRegisterMount() in registration-view.js
// when the page is loaded via SPA router. DOMContentLoaded won't work with SPA routing.
