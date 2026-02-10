/**
 * Enhanced Dashboard - Mount Functions and Form Handlers (Part 2)
 */

// ========================================
// DASHBOARD MOUNT FUNCTION
// ========================================
function enhancedDashboardMount() {
    const authToken = sessionStorage.getItem('authToken');
    const userStr = sessionStorage.getItem('user');

    if (!authToken || !userStr) {
        window.location.hash = '/login';
        return;
    }

    const user = JSON.parse(userStr);

    // Load master data
    loadMasterData();

    // Setup sidebar navigation
    setupSidebarNavigation(user);

    // Load initial section (Admin Dashboard for super_admin, Overview for others)
    const initialSection = (user.roles && user.roles.includes('super_admin')) ? 'admin' : 'overview';
    loadDashboardSection(initialSection, user);

    // Update active sidebar link
    const links = document.querySelectorAll('.sidebar-link[data-section]');
    links.forEach(l => l.classList.remove('active'));
    const initialLink = document.querySelector(`.sidebar-link[data-section="${initialSection}"]`);
    if (initialLink) initialLink.classList.add('active');

    // Setup logout
    document.getElementById('sidebarLogout').addEventListener('click', async (e) => {
        e.preventDefault();
        await logout(authToken);
    });

    // Check profile completion to hide registration link if already done
    fetch(`${CONFIG.API_BASE_URL}/api/profile/get-profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(profileData => {
            if (profileData.profile &&
                profileData.academic && profileData.academic.length > 0 &&
                profileData.affiliation &&
                profileData.projects && profileData.projects.length > 0) {

                const regLink = document.querySelector('.sidebar-link[data-section="registration"]');
                if (regLink) {
                    regLink.style.display = 'none';
                }
            }
        })
        .catch(err => console.error('Error checking profile completion:', err));
}

// ========================================
// NAVIGATION
// ========================================
function setupSidebarNavigation(user) {
    const links = document.querySelectorAll('.sidebar-link[data-section]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');

            // Update active state
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Load section
            loadDashboardSection(section, user);
        });
    });

    // Handle section links in content
    document.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-section')) {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');

            // Update sidebar
            links.forEach(l => l.classList.remove('active'));
            const targetLink = document.querySelector(`.sidebar-link[data-section="${section}"]`);
            if (targetLink) targetLink.classList.add('active');

            loadDashboardSection(section, user);
        }
    });
}

async function loadDashboardSection(section, user) {
    currentSection = section;
    const content = document.getElementById('dashboardContent');
    const authToken = sessionStorage.getItem('authToken');

    switch (section) {
        case 'overview':
            content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
            loadOverview(user);
            break;
        case 'registration':
            content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
            // Check if profile is already complete
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/get-profile`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const profileData = await response.json();

                // If all sections are present, redirect to profile
                if (profileData.profile &&
                    profileData.academic && profileData.academic.length > 0 &&
                    profileData.affiliation &&
                    profileData.projects && profileData.projects.length > 0) {

                    showToast('Registration already completed!', 'info');
                    loadDashboardSection('profile', user);

                    // Update sidebar active state
                    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                    const profileLink = document.querySelector('.sidebar-link[data-section="profile"]');
                    if (profileLink) profileLink.classList.add('active');
                    return;
                }
            } catch (error) {
                console.error('Error checking profile status:', error);
            }

            content.innerHTML = getRegistrationSection(user);
            setupRegistrationForm();
            break;
        case 'profile':
            content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
            loadFullProfile(user);
            break;
        case 'admin':
            content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
            loadAdminDashboard(user);
            break;
        case 'settings':
            content.innerHTML = getSettingsSection(user);
            setupSettingsForm();
            break;
        case 'requests':
            content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
            loadRequests(user);
            break;
    }
}

async function loadRequests(user) {
    const authToken = sessionStorage.getItem('authToken');
    const content = document.getElementById('dashboardContent');
    const endpoint = (user.roles && user.roles.some(r => r.level < 7)) ? 'all' : 'user';

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/requests/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        content.innerHTML = getRequestsSection(user, data.requests);
        setupRequestForm(user);
    } catch (error) {
        console.error('Error loading requests:', error);
        content.innerHTML = '<div class="alert alert-error">Failed to load requests.</div>';
    }
}

function setupRequestForm(user) {
    const form = document.getElementById('newRequestForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('reqSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const payload = {
            type: document.getElementById('req_type').value,
            details: document.getElementById('req_details').value,
            department_id: document.getElementById('req_dept').value, // This is a string/name for now as per user req
        };

        try {
            const authToken = sessionStorage.getItem('authToken');
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/requests/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Request submitted successfully', 'success');
                closeRequestModal();
                if (currentSection === 'requests') loadRequests(user);
                else loadOverview(user);
            } else {
                showToast('Error submitting request', 'error');
            }
        } catch (error) {
            showToast('Network error', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Request';
        }
    });
}

window.openRequestModal = function () {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'flex';
}

window.closeRequestModal = function () {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
}

// ========================================
// MASTER DATA
// ========================================
async function loadMasterData() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/master-data`);
        const data = await response.json();

        masterData = data;

        // Populate country dropdowns if they exist
        populateCountryDropdowns(data.countries);

    } catch (error) {
        console.error('Error loading master data:', error);
    }
}

function populateCountryDropdowns(countries) {
    const dropdowns = ['personalCountry', 'instituteCountry', 'affiliationCountry', 'projectCountry'];

    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select && countries) {
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                select.appendChild(option);
            });
        }
    });
}

// ========================================
// REGISTRATION FORM SETUP
// ========================================
function setupRegistrationForm() {
    currentStep = 1;

    // Populate dropdowns
    populateDropdowns();

    // Setup profile photo preview
    const photoInput = document.getElementById('profilePhoto');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoPreview);
    }

    // Setup institute/department cascading
    const instituteSelect = document.getElementById('instituteSelect');
    if (instituteSelect) {
        instituteSelect.addEventListener('change', handleInstituteChange);
    }

    const departmentSelect = document.getElementById('departmentSelect');
    if (departmentSelect) {
        departmentSelect.addEventListener('change', handleDepartmentChange);
    }

    // Setup state/city cascading for India
    const personalCountry = document.getElementById('personalCountry');
    if (personalCountry) {
        personalCountry.addEventListener('change', handleCountryChange);
    }

    // Setup form submissions
    setupFormSubmissions();
}

function populateDropdowns() {
    // Populate countries first
    if (masterData.countries) {
        populateCountryDropdowns(masterData.countries);
    }

    // Populate supervisors
    const supervisorSelect = document.getElementById('supervisorSelect');
    if (supervisorSelect && masterData.supervisors) {
        masterData.supervisors.forEach(supervisor => {
            const option = document.createElement('option');
            option.value = supervisor.id;
            option.textContent = supervisor.name;
            supervisorSelect.appendChild(option);
        });
    }

    // Populate institutes
    const instituteSelect = document.getElementById('instituteSelect');
    if (instituteSelect && masterData.institutes) {
        masterData.institutes.forEach(institute => {
            const option = document.createElement('option');
            option.value = institute.id;
            option.textContent = institute.name;
            instituteSelect.appendChild(option);
        });
    }
}

async function handleInstituteChange(e) {
    const instituteId = e.target.value;
    const departmentSelect = document.getElementById('departmentSelect');

    // Clear existing options
    departmentSelect.innerHTML = '<option value="">Select Department</option>';
    departmentSelect.disabled = !instituteId;

    if (instituteId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/departments/${instituteId}`);
            const data = await response.json();

            data.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    // Reset sub-department
    const subDeptSelect = document.getElementById('subDepartmentSelect');
    subDeptSelect.innerHTML = '<option value="">Select Department First</option>';
    subDeptSelect.disabled = true;
}

async function handleDepartmentChange(e) {
    const departmentId = e.target.value;
    const subDeptSelect = document.getElementById('subDepartmentSelect');

    // Clear existing options
    subDeptSelect.innerHTML = '<option value="">Select Sub-Department</option>';
    subDeptSelect.disabled = !departmentId;

    if (departmentId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/sub-departments/${departmentId}`);
            const data = await response.json();

            data.sub_departments.forEach(subDept => {
                const option = document.createElement('option');
                option.value = subDept.id;
                option.textContent = subDept.name;
                subDeptSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading sub-departments:', error);
        }
    }
}

async function handleCountryChange(e) {
    const country = e.target.value;
    const stateSelect = document.querySelector('select[name="state"]');
    const citySelect = document.querySelector('select[name="city"]');

    // If India is selected, show state dropdown and populate it
    if (country === 'India') {
        // Convert state input to select if needed
        if (stateSelect && stateSelect.tagName === 'INPUT') {
            const parent = stateSelect.parentElement;
            const newSelect = document.createElement('select');
            newSelect.className = stateSelect.className;
            newSelect.name = 'state';
            newSelect.required = true;
            newSelect.innerHTML = '<option value="">Select State</option>';

            // Add Indian states
            const indianStates = [
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                "Uttar Pradesh", "Uttarakhand", "West Bengal",
                "Andaman and Nicobar Islands", "Chandigarh",
                "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
                "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
            ];

            indianStates.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                newSelect.appendChild(option);
            });

            newSelect.addEventListener('change', handleStateChange);
            parent.replaceChild(newSelect, stateSelect);
        }

        // Convert city input to select
        if (citySelect && citySelect.tagName === 'INPUT') {
            const parent = citySelect.parentElement;
            const newSelect = document.createElement('select');
            newSelect.className = citySelect.className;
            newSelect.name = 'city';
            newSelect.required = true;
            newSelect.innerHTML = '<option value="">Select State First</option>';
            newSelect.disabled = true;
            parent.replaceChild(newSelect, citySelect);
        }
    } else {
        // For other countries, convert select back to input
        if (stateSelect && stateSelect.tagName === 'SELECT') {
            const parent = stateSelect.parentElement;
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = stateSelect.className;
            newInput.name = 'state';
            newInput.required = true;
            newInput.placeholder = 'Enter State/Province';
            parent.replaceChild(newInput, stateSelect);
        }

        if (citySelect && citySelect.tagName === 'SELECT') {
            const parent = citySelect.parentElement;
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = citySelect.className;
            newInput.name = 'city';
            newInput.required = true;
            newInput.placeholder = 'Enter City/Town';
            parent.replaceChild(newInput, citySelect);
        }
    }
}

async function handleStateChange(e) {
    const state = e.target.value;
    const citySelect = document.querySelector('select[name="city"]');

    if (!citySelect || !state) return;

    // Clear existing options
    citySelect.innerHTML = '<option value="">Loading...</option>';
    citySelect.disabled = true;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/cities/${encodeURIComponent(state)}`);
        const data = await response.json();

        citySelect.innerHTML = '<option value="">Select City</option>';

        if (data.cities && data.cities.length > 0) {
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        } else {
            citySelect.innerHTML = '<option value="">No cities available</option>';
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        citySelect.innerHTML = '<option value="">Error loading cities</option>';
    }
}

function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Profile">`;
        };
        reader.readAsDataURL(file);
    }
}

// ========================================
// FORM NAVIGATION
// ========================================
function nextStep() {
    const currentForm = document.getElementById(`step${currentStep}`).querySelector('form');

    if (!currentForm.checkValidity()) {
        currentForm.reportValidity();
        return;
    }

    // Save current step data
    saveStepData(currentStep, currentForm);

    if (currentStep < 4) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('completed');

        // Show next step
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');

        // Update progress
        updateProgress();
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show previous step
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');

        // Update progress
        updateProgress();
    }
}

function updateProgress() {
    const progress = (currentStep / 4) * 100;
    document.getElementById('formProgress').style.width = `${progress}%`;
}

function saveStepData(step, form) {
    const formDataObj = new FormData(form);
    const data = {};

    for (let [key, value] of formDataObj.entries()) {
        data[key] = value;
    }

    switch (step) {
        case 1:
            formData.personal = data;
            break;
        case 2:
            formData.academic = data;
            break;
        case 3:
            formData.affiliation = data;
            break;
        case 4:
            formData.project = data;
            break;
    }
}

// ========================================
// FORM SUBMISSIONS
// ========================================
function setupFormSubmissions() {
    // Personal Info Form
    const personalForm = document.getElementById('personalInfoForm');
    if (personalForm) {
        personalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            nextStep();
        });
    }

    // Academic Info Form
    const academicForm = document.getElementById('academicInfoForm');
    if (academicForm) {
        academicForm.addEventListener('submit', (e) => {
            e.preventDefault();
            nextStep();
        });
    }

    // Affiliation Form
    const affiliationForm = document.getElementById('affiliationForm');
    if (affiliationForm) {
        affiliationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            nextStep();
        });
    }

    // Project Form (Final submission)
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleFinalSubmission);
    }
}

async function handleFinalSubmission(e) {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Save final step data
    saveStepData(4, form);

    const authToken = sessionStorage.getItem('authToken');
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    try {
        // Submit all sections
        await submitPersonalInfo(authToken);
        await submitAcademicInfo(authToken);
        await submitAffiliationInfo(authToken);
        await submitProjectInfo(authToken);

        // Upload photo if exists
        const photoFile = document.getElementById('profilePhoto').files[0];
        if (photoFile) {
            await uploadProfilePhoto(authToken, photoFile);
        }

        showToast('Registration completed successfully!', 'success');

        // Redirect to profile
        setTimeout(() => {
            loadDashboardSection('profile', JSON.parse(sessionStorage.getItem('user')));
        }, 2000);

    } catch (error) {
        console.error('Submission error:', error);
        showToast('Error submitting registration. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}

async function addAcademicEntry() {
    const form = document.getElementById('academicInfoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formDataObj = new FormData(form);
    const entry = {};
    for (let [key, value] of formDataObj.entries()) {
        entry[key] = value;
    }

    formData.academic.push(entry);

    // Refresh the academic section UI
    document.getElementById('dashboardContent').innerHTML = getAcademicInfoForm();
    populateDropdowns(); // Re-populate country dropdown
}

function removeAcademicEntry(index) {
    formData.academic.splice(index, 1);
    document.getElementById('dashboardContent').innerHTML = getAcademicInfoForm();
    populateDropdowns();
}

function saveStepData(step, form) {
    const formDataObj = new FormData(form);
    const data = {};

    for (let [key, value] of formDataObj.entries()) {
        data[key] = value;
    }

    switch (step) {
        case 1:
            formData.personal = data;
            break;
        case 2:
            // Academic is handled by addAcademicEntry
            break;
        case 3:
            formData.affiliation = data;
            break;
        case 4:
            formData.project = data;
            break;
    }
}

async function submitPersonalInfo(token) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/personal-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token, ...formData.personal })
    });

    if (!response.ok) {
        throw new Error('Failed to save personal info');
    }

    return response.json();
}

async function submitAcademicInfo(token) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/academic-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData.academic)
    });

    if (!response.ok) {
        throw new Error('Failed to save academic info');
    }

    return response.json();
}

async function submitAffiliationInfo(token) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/affiliation-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token, ...formData.affiliation })
    });

    if (!response.ok) {
        throw new Error('Failed to save affiliation info');
    }

    return response.json();
}

async function submitProjectInfo(token) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/project-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token, ...formData.project })
    });

    if (!response.ok) {
        throw new Error('Failed to save project info');
    }

    return response.json();
}

async function uploadProfilePhoto(token, file) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('profile_photo', file);

    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/upload-photo`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload photo');
    }

    return response.json();
}

async function logout(authToken) {
    try {
        await fetch(`${CONFIG.API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
}

// ========================================
// PROFILE LOADING
// ========================================
async function loadFullProfile(user) {
    const authToken = sessionStorage.getItem('authToken');
    const content = document.getElementById('dashboardContent');

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/get-profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (response.ok) {
            content.innerHTML = getProfileSection(user, data);
        } else {
            content.innerHTML = `<div class="alert alert-error">Error loading profile: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        content.innerHTML = '<div class="alert alert-error">Failed to load profile details.</div>';
    }
}

// ========================================
// OVERVIEW LOADING
// ========================================
async function loadOverview(user) {
    const authToken = sessionStorage.getItem('authToken');
    const content = document.getElementById('dashboardContent');

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile/get-profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const profileData = await response.json();

        // Calculate completion percentage
        let completion = 0;
        if (profileData.profile) completion += 25;
        if (profileData.academic && profileData.academic.length > 0) completion += 25;
        if (profileData.affiliation) completion += 25;
        if (profileData.projects && profileData.projects.length > 0) completion += 25;

        content.innerHTML = getOverviewSection(user, completion, profileData);
        setupRequestForm(user);
    } catch (error) {
        console.error('Error loading overview:', error);
        content.innerHTML = getOverviewSection(user, 0, null);
    }
}

// ========================================
// ADMIN DASHBOARD
// ========================================
async function loadAdminDashboard(user) {
    const authToken = sessionStorage.getItem('authToken');
    const content = document.getElementById('dashboardContent');

    try {
        // Fetch all admin data in parallel
        const [usersRes, rolesRes, permissionsRes] = await Promise.all([
            fetch(`${CONFIG.API_BASE_URL}/api/admin/users`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
            fetch(`${CONFIG.API_BASE_URL}/api/admin/roles`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
            fetch(`${CONFIG.API_BASE_URL}/api/admin/permissions`, { headers: { 'Authorization': `Bearer ${authToken}` } })
        ]);

        const usersData = await usersRes.json();
        const rolesData = await rolesRes.json();
        const permissionsData = await permissionsRes.json();

        if (usersRes.ok && rolesRes.ok && permissionsData) {
            content.innerHTML = getAdminSection(user, {
                users: usersData.users,
                roles: rolesData.roles,
                permissions: permissionsData.permissions
            });

            // Initialize Admin UI Helpers
            setupAdminHandlers(user);
        } else {
            content.innerHTML = `<div class="alert alert-error">Access denied or error loading data.</div>`;
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        content.innerHTML = '<div class="alert alert-error">Failed to load admin dashboard.</div>';
    }
}

function setupAdminHandlers(user) {
    // 1. Tab Switching
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content visibility
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(`${target}Tab`).style.display = 'block';
        });
    });

    // 2. Role Form Submission
    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const roleSaveBtn = document.getElementById('roleSaveBtn');
            roleSaveBtn.disabled = true;
            roleSaveBtn.textContent = 'Saving...';

            const permissions = Array.from(document.querySelectorAll('input[name="role_permissions"]:checked')).map(cb => cb.value);

            const payload = {
                id: document.getElementById('roleId').value,
                name: document.getElementById('roleName').value,
                slug: document.getElementById('roleSlug').value,
                level: document.getElementById('roleLevel').value,
                description: document.getElementById('roleDescription').value,
                permissions: permissions
            };

            try {
                const authToken = sessionStorage.getItem('authToken');
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/save-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    showToast('Role saved successfully', 'success');
                    closeRoleModal();
                    loadAdminDashboard(user); // Reload
                } else {
                    const data = await response.json();
                    showToast(data.message || 'Error saving role', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Network error', 'error');
            } finally {
                roleSaveBtn.disabled = false;
                roleSaveBtn.textContent = 'Save Role';
            }
        });
    }

    // 3. Role Assignment Submission
    const roleAssignForm = document.getElementById('roleAssignForm');
    if (roleAssignForm) {
        roleAssignForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const assignSaveBtn = document.getElementById('assignSaveBtn');
            assignSaveBtn.disabled = true;

            const userId = document.getElementById('assignUserId').value;
            const roleCheckboxes = document.querySelectorAll('input[name="user_roles"]:checked');

            const roles = Array.from(roleCheckboxes).map(cb => {
                const roleId = cb.value;
                const slug = cb.getAttribute('data-slug');

                let scope = { id: roleId };
                if (slug === 'department_lead') {
                    scope.department_id = document.querySelector(`[name="scope_dept_${roleId}"]`)?.value;
                } else if (slug === 'sub_department_lead') {
                    scope.sub_department_id = document.querySelector(`[name="scope_subdept_${roleId}"]`)?.value;
                } else if (slug === 'li_coordinator') {
                    scope.institute_id = document.querySelector(`[name="scope_inst_${roleId}"]`)?.value;
                }
                return scope;
            });

            try {
                const authToken = sessionStorage.getItem('authToken');
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/assign-roles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ user_id: userId, roles: roles })
                });

                if (response.ok) {
                    showToast('Roles updated successfully', 'success');
                    closeRoleAssignModal();
                    loadAdminDashboard(user);
                } else {
                    showToast('Error updating roles', 'error');
                }
            } catch (error) {
                showToast('Network error', 'error');
            } finally {
                assignSaveBtn.disabled = false;
            }
        });
    }
}

// Global UI Helpers
window.toggleRoleScope = function (checkbox) {
    const roleId = checkbox.value;
    const container = document.getElementById(`scope_container_${roleId}`);
    if (container) {
        container.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// Global Modal Functions (attached to window for dynamic HTML)
window.openRoleModal = function (role = null) {
    const modal = document.getElementById('roleModal');
    const title = document.getElementById('roleModalTitle');
    const form = document.getElementById('roleForm');

    modal.style.display = 'flex';
    form.reset();

    if (role) {
        title.textContent = 'Edit Role: ' + role.name;
        document.getElementById('roleId').value = role.id;
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleSlug').value = role.slug;
        document.getElementById('roleLevel').value = role.level;
        document.getElementById('roleDescription').value = role.description || '';

        // Check permissions
        const rolePermIds = role.permissions.map(p => p.id.toString());
        document.querySelectorAll('input[name="role_permissions"]').forEach(cb => {
            cb.checked = rolePermIds.includes(cb.value);
        });
    } else {
        title.textContent = 'Create New Role';
        document.getElementById('roleId').value = '';
    }
};

window.closeRoleModal = function () {
    document.getElementById('roleModal').style.display = 'none';
};

window.openRoleAssignmentModal = function (userId, username, roles) {
    const modal = document.getElementById('roleAssignModal');
    modal.style.display = 'flex';
    document.getElementById('assignUserId').value = userId;
    document.getElementById('assignTargetUser').textContent = username;

    const currentRoleIds = roles.map(r => r.id.toString());

    // Reset all
    document.querySelectorAll('input[name="user_roles"]').forEach(cb => {
        cb.checked = false;
        toggleRoleScope(cb);
    });

    // Set current
    roles.forEach(role => {
        const cb = document.querySelector(`input[name="user_roles"][value="${role.id}"]`);
        if (cb) {
            cb.checked = true;
            toggleRoleScope(cb);

            // Set scope values
            const pivot = role.pivot;
            if (pivot) {
                if (pivot.department_id) {
                    const input = document.querySelector(`[name="scope_dept_${role.id}"]`);
                    if (input) input.value = pivot.department_id;
                }
                if (pivot.sub_department_id) {
                    const input = document.querySelector(`[name="scope_subdept_${role.id}"]`);
                    if (input) input.value = pivot.sub_department_id;
                }
                if (pivot.institute_id) {
                    const input = document.querySelector(`[name="scope_inst_${role.id}"]`);
                    if (input) input.value = pivot.institute_id;
                }
            }
        }
    });
}

window.closeRoleAssignModal = function () {
    document.getElementById('roleAssignModal').style.display = 'none';
};

// ========================================
// SETTINGS HANDLERS
// ========================================
function setupSettingsForm() {
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.addEventListener('submit', handlePasswordChange);
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const current_password = document.getElementById('current_password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const messageDiv = document.getElementById('passwordMessage');
    const submitBtn = document.getElementById('passwordSubmitBtn');

    if (new_password !== confirm_password) {
        messageDiv.innerHTML = '<div class="alert alert-error">New passwords do not match</div>';
        return;
    }

    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    messageDiv.innerHTML = '';

    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                current_password,
                new_password,
                new_password_confirmation: confirm_password
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = '<div class="alert alert-success">Password updated successfully!</div>';
            e.target.reset();
        } else {
            messageDiv.innerHTML = `<div class="alert alert-error">${data.message || 'Failed to update password'}</div>`;
        }
    } catch (error) {
        console.error('Error changing password:', error);
        messageDiv.innerHTML = '<div class="alert alert-error">Network error. Please try again.</div>';
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
    }
}
