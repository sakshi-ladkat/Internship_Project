/**
 * Enhanced Dashboard with Multi-Step Registration Form
 */

// Global state for form data
let formData = {
    personal: {},
    academic: [],
    affiliation: {},
    project: {}
};

let masterData = {};
let currentStep = 1;
let currentSection = 'overview';

// ========================================
// ENHANCED DASHBOARD VIEW
// ========================================
function enhancedDashboardView() {
    const authToken = sessionStorage.getItem('authToken');
    const userStr = sessionStorage.getItem('user');

    if (!authToken || !userStr) {
        window.location.hash = '/login';
        return '<div>Redirecting...</div>';
    }

    const user = JSON.parse(userStr);

    return `
        <div class="dashboard-container">
            <!-- Sidebar -->
            <aside class="dashboard-sidebar">
                <nav>
                    <a href="#" class="sidebar-link active" data-section="overview">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        Overview
                    </a>
                    ${!(user.roles && user.roles.includes('super_admin')) ? `
                    <a href="#" class="sidebar-link" data-section="registration">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Registration Form
                    </a>
                    ` : ''}
                    <a href="#" class="sidebar-link" data-section="profile">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        My Profile
                    </a>
                    <a href="#" class="sidebar-link" data-section="settings">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Settings
                    </a>
                    ${user.roles && user.roles.includes('super_admin') ? `
                    <a href="#" class="sidebar-link" data-section="admin">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                        </svg>
                        Admin Dashboard
                    </a>
                    ` : ''}
                    <a href="#" class="sidebar-link" id="sidebarLogout">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Logout
                    </a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="dashboard-main">
                <div id="dashboardContent">
                    <!-- Content will be loaded here -->
                </div>
            </main>
        </div>
    `;
}

// ========================================
// DASHBOARD SECTIONS
// ========================================
function getOverviewSection(user, completion = 0, profileData = null) {
    const isSuperAdmin = user.roles && user.roles.includes('super_admin');

    return `
        <div class="dashboard-header">
            <h1>Welcome back, ${user.username}! 👋</h1>
            <p>${isSuperAdmin ? 'System Status Overview' : "Here's what's happening with your account today."}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${!isSuperAdmin ? (completion < 100 ? `
            <div class="card">
                <h3 style="color: var(--primary-600); margin-bottom: 1rem;">📋 Profile Completion</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completion}%"></div>
                </div>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">${completion}% Complete</p>
                <a href="#" class="btn btn-outline mt-md" data-section="registration">Complete Profile</a>
            </div>
            ` : `
            <div class="card">
                <h3 style="color: var(--primary-600); margin-bottom: 1rem;">🚀 User Dashboard</h3>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem;">Everything is set up! You can now participate in projects.</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="openRequestModal()">+ New Request</button>
                    <button class="btn btn-outline btn-sm" onclick="loadDashboardSection('requests', ${JSON.stringify(user).replace(/"/g, '&quot;')})">My Requests</button>
                </div>
            </div>
            `) : `
            <div class="card">
                <h3 style="color: var(--primary-600); margin-bottom: 1rem;">📊 System Quick Stats</h3>
                <p style="font-size: 1.25rem; font-weight: 600;">System is Online</p>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">Total Users: Loading...</p>
                <a href="#" class="btn btn-outline mt-md" data-section="admin">Manage System</a>
            </div>
            `}

            <div class="card">
                <h3 style="color: var(--success); margin-bottom: 1rem;">✅ Account Status</h3>
                <p style="font-size: 0.875rem; color: var(--gray-600);">
                    <strong>Email:</strong> ${user.email}<br>
                    <strong>Status:</strong> <span style="color: var(--success);">Active</span><br>
                    <strong>Role:</strong> ${user.roles ? user.roles.map(r => r.name).join(', ') : 'User'}
                </p>
            </div>

            <div class="card">
                <h3 style="color: var(--info); margin-bottom: 1rem;">🎯 Quick Actions</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${isSuperAdmin ? `
                    <a href="#" class="btn btn-outline" data-section="admin">User Management</a>
                    <a href="#" class="btn btn-outline" data-section="settings">System Settings</a>
                    ` : `
                    ${completion < 100 ? '<a href="#" class="btn btn-outline" data-section="registration">Fill Registration Form</a>' : ''}
                    ${completion === 100 ? '<a href="#" class="btn btn-outline" data-section="requests">View Requests</a>' : ''}
                    <a href="#" class="btn btn-outline" data-section="profile">View My Profile</a>
                    <a href="#" class="btn btn-outline" data-section="settings">Account Settings</a>
                    `}
                </div>
            </div>
        </div>
    `;
}

function getRegistrationSection(user) {
    return `
        <div class="dashboard-header">
            <h1>Registration Form</h1>
            <p>Complete your profile by filling in all required information</p>
        </div>

        <div class="card">
            <!-- Progress Bar -->
            <div class="progress-bar">
                <div class="progress-fill" id="formProgress" style="width: 25%"></div>
            </div>

            <!-- Form Steps Indicator -->
            <div class="form-steps">
                <div class="form-step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-label">Personal Info</div>
                </div>
                <div class="form-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-label">Academic Info</div>
                </div>
                <div class="form-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-label">Affiliation</div>
                </div>
                <div class="form-step" data-step="4">
                    <div class="step-number">4</div>
                    <div class="step-label">Project Details</div>
                </div>
            </div>

            <!-- Form Sections -->
            ${getPersonalInfoForm(user)}
            ${getAcademicInfoForm()}
            ${getAffiliationForm()}
            ${getProjectDetailsForm()}
        </div>
    `;
}

function getPersonalInfoForm(user) {
    return `
        <div class="form-section active" id="step1">
            <h3 style="margin-bottom: 1.5rem;">Personal Information</h3>
            <form id="personalInfoForm">
                <!-- Name -->
                <div class="form-row-3">
                    <div class="form-group">
                        <label class="form-label">First Name *</label>
                        <input type="text" class="form-input" name="first_name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Middle Name</label>
                        <input type="text" class="form-input" name="middle_name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name *</label>
                        <input type="text" class="form-input" name="last_name" required>
                    </div>
                </div>

                <!-- DOB and Gender -->
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date of Birth *</label>
                        <input type="date" class="form-input" name="date_of_birth" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender *</label>
                        <select class="form-input" name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <!-- Mobile -->
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Country Code *</label>
                        <select class="form-input" name="country_code" required>
                            <option value="+1">+1 (USA/Canada)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+91">+91 (India)</option>
                            <option value="+86">+86 (China)</option>
                            <option value="+81">+81 (Japan)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Mobile Number *</label>
                        <input type="tel" class="form-input" name="mobile_number" required>
                    </div>
                </div>

                <!-- Email -->
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Primary Email (Verified)</label>
                        <input type="email" class="form-input" name="personal_email" value="${user.email}" readonly style="background-color: var(--gray-100); cursor: not-allowed;">
                        <small style="color: var(--success); font-weight: 500;">✓ This email is verified and cannot be changed here.</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Alternate Email</label>
                        <input type="email" class="form-input" name="alternate_email" placeholder="Optional backup email">
                    </div>
                </div>

                <!-- Address -->
                <div class="form-group">
                    <label class="form-label">Address Line 1 *</label>
                    <input type="text" class="form-input" name="address_line1" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Address Line 2</label>
                        <input type="text" class="form-input" name="address_line2">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address Line 3</label>
                        <input type="text" class="form-input" name="address_line3">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">City/Town *</label>
                        <input type="text" class="form-input" name="city" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">State/Province *</label>
                        <input type="text" class="form-input" name="state" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Country *</label>
                        <select class="form-input" name="country" id="personalCountry" required>
                            <option value="">Select Country</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Postal/ZIP Code *</label>
                        <input type="text" class="form-input" name="postal_code" required>
                    </div>
                </div>

                <!-- Additional Info -->
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nationality *</label>
                        <input type="text" class="form-input" name="nationality" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Country of Citizenship *</label>
                        <input type="text" class="form-input" name="country_of_citizenship" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Type of Student *</label>
                    <select class="form-input" name="student_type" required>
                        <option value="">Select Type</option>
                        <option value="Internal Student">Internal Student</option>
                        <option value="External Student">External Student</option>
                    </select>
                </div>

                <!-- Profile Photo -->
                <div class="form-group">
                    <label class="form-label">Profile Photo</label>
                    <div class="profile-photo-upload">
                        <div class="photo-preview" id="photoPreview">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <div>
                            <input type="file" id="profilePhoto" accept="image/png,image/jpg,image/jpeg" style="display: none;">
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('profilePhoto').click()">
                                Choose Photo
                            </button>
                            <p style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.5rem;">
                                PNG, JPG, JPEG (Max 2MB)
                            </p>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <div></div>
                    <button type="button" class="btn btn-primary" onclick="nextStep()">
                        Next Step →
                    </button>
                </div>
            </form>
        </div>
    `;
}

function getAcademicInfoForm() {
    return `
        <div class="form-section" id="step2">
            <h3 style="margin-bottom: 1rem;">Academic Information</h3>
            <p style="color: var(--gray-600); margin-bottom: 1.5rem; font-size: 0.875rem;">Add your educational qualifications. You can add multiple entries (e.g., High School, Bachelors, Masters).</p>

            <!-- Added List -->
            <div id="academicEntriesList" style="margin-bottom: 2rem;">
                ${formData.academic.length > 0 ? formData.academic.map((edu, index) => `
                    <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; background: var(--gray-50); padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--gray-200);">
                        <div>
                            <strong>${edu.degree_title} (${edu.degree_level})</strong>
                            <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">${edu.institute_name}</p>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline" style="color: var(--danger);" onclick="removeAcademicEntry(${index})">Remove</button>
                    </div>
                `).join('') : '<p style="text-align: center; color: var(--gray-400); padding: 1rem; border: 2px dashed var(--gray-200); border-radius: 0.5rem;">No qualifications added yet.</p>'}
            </div>

            <form id="academicInfoForm" style="background: var(--gray-50); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--gray-200);">
                <h4 style="margin-bottom: 1rem; font-size: 1rem; color: var(--gray-700);">Add New Qualification</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Degree Level *</label>
                        <select class="form-input" name="degree_level" id="edu_level" required>
                            <option value="">Select Level</option>
                            <option value="High School">High School</option>
                            <option value="Bachelors">Bachelor's</option>
                            <option value="Masters">Master's</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Postdoc">Postdoc</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Degree Title *</label>
                        <input type="text" class="form-input" name="degree_title" id="edu_title" placeholder="e.g. B.Tech Computer Science" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Specialization</label>
                    <input type="text" class="form-input" name="specialization" id="edu_spec">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Institute Name *</label>
                        <input type="text" class="form-input" name="institute_name" id="edu_inst" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Institute Country *</label>
                        <select class="form-input" name="institute_country" id="instituteCountry" required>
                            <option value="">Select Country</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date *</label>
                        <input type="date" class="form-input" name="start_date" id="edu_start" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-input" name="end_date" id="edu_end">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Grading System *</label>
                        <select class="form-input" name="grading_system" id="edu_grade_sys" required>
                            <option value="">Select System</option>
                            <option value="Percentage">Percentage</option>
                            <option value="CGPA (10-point)">CGPA (10-point)</option>
                            <option value="CGPA (4-point)">CGPA (4-point)</option>
                            <option value="GPA">GPA</option>
                            <option value="Letter Grades">Letter Grades</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grade Value *</label>
                        <input type="text" class="form-input" name="grade_value" id="edu_grade_val" required>
                    </div>
                </div>

                <div class="form-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" name="is_current" id="edu_current" value="1">
                        <span>This is my current education</span>
                    </label>
                </div>

                <button type="button" class="btn btn-outline" style="width: 100%;" onclick="addAcademicEntry()">
                    + Add This Qualification
                </button>
            </form>

            <div class="form-actions" style="margin-top: 2rem;">
                <button type="button" class="btn btn-secondary" onclick="prevStep()">
                    ← Previous
                </button>
                <button type="button" class="btn btn-primary" id="academicNextBtn" onclick="nextStep()" ${formData.academic.length === 0 ? 'disabled' : ''}>
                    Next Step →
                </button>
            </div>
        </div>
    `;
}

function getAffiliationForm() {
    return `
        <div class="form-section" id="step3">
            <h3 style="margin-bottom: 1.5rem;">Working / Affiliation Details</h3>
            <form id="affiliationForm">
                <div class="form-group">
                    <label class="form-label">Current Affiliation *</label>
                    <select class="form-input" name="current_affiliation" required>
                        <option value="">Select Affiliation</option>
                        <option value="Student">Student</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Industry Professional">Industry Professional</option>
                        <option value="Independent Researcher">Independent Researcher</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Affiliated Organization/University *</label>
                        <input type="text" class="form-input" name="affiliated_organization" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Country *</label>
                        <select class="form-input" name="country" id="affiliationCountry" required>
                            <option value="">Select Country</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Position/Role *</label>
                    <input type="text" class="form-input" name="position_role" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date *</label>
                        <input type="date" class="form-input" name="start_date" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-input" name="end_date">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="prevStep()">
                        ← Previous
                    </button>
                    <button type="button" class="btn btn-primary" onclick="nextStep()">
                        Next Step →
                    </button>
                </div>
            </form>
        </div>
    `;
}

function getProjectDetailsForm() {
    return `
        <div class="form-section" id="step4">
            <h3 style="margin-bottom: 1.5rem;">Project Details</h3>
            <form id="projectForm">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Supervisor Name *</label>
                        <select class="form-input" name="supervisor_id" id="supervisorSelect" required>
                            <option value="">Select Supervisor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Institute *</label>
                        <select class="form-input" name="institute_id" id="instituteSelect" required>
                            <option value="">Select Institute</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Department *</label>
                        <select class="form-input" name="department_id" id="departmentSelect" required disabled>
                            <option value="">Select Institute First</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Sub-Department</label>
                        <select class="form-input" name="sub_department_id" id="subDepartmentSelect" disabled>
                            <option value="">Select Department First</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Country *</label>
                    <select class="form-input" name="country" id="projectCountry" required>
                        <option value="">Select Country</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Project Title</label>
                    <input type="text" class="form-input" name="project_title">
                </div>

                <div class="form-group">
                    <label class="form-label">Project Description</label>
                    <textarea class="form-input" name="project_description" rows="4"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="date" class="form-input" name="start_date">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-input" name="end_date">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="prevStep()">
                        ← Previous
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Submit Registration
                    </button>
                </div>
            </form>
        </div>
    `;
}

function getProfileSection(user, profileData) {
    const isSuperAdmin = user.roles && user.roles.includes('super_admin');

    if (!profileData || !profileData.profile) {
        if (isSuperAdmin) {
            return `
                <div class="dashboard-header">
                    <h1>Admin Profile</h1>
                    <p>Manage your account settings</p>
                </div>
                <div class="card">
                    <div style="display: flex; align-items: center; gap: 2rem; padding: 1rem;">
                        <div class="profile-photo-large" style="margin: 0;">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <h2 style="margin: 0;">${user.username}</h2>
                            <p style="color: var(--gray-600); margin: 0;">${user.email}</p>
                            <span class="badge badge-success" style="margin-top: 0.5rem;">Super Administrator</span>
                        </div>
                    </div>
                </div>
                <div class="card" style="margin-top: 1.5rem;">
                    <h3>Account Security</h3>
                    <p style="color: var(--gray-600);">Your account is protected by Superadmin privileges.</p>
                    <button class="btn btn-outline" data-section="settings">Change Password</button>
                </div>
            `;
        }

        return `
            <div class="dashboard-header">
                <h1>My Profile</h1>
                <p>View and manage your profile information</p>
            </div>
            <div class="card">
                <p style="text-align: center; color: var(--gray-600); padding: 3rem;">
                    You haven't completed your profile registration yet.
                </p>
                <div style="text-align: center;">
                    <a href="#" class="btn btn-primary" data-section="registration">Complete Registration</a>
                </div>
            </div>
        `;
    }

    const { profile, academic, affiliation, projects } = profileData;

    return `
        <div class="dashboard-header">
            <h1>My Profile</h1>
            <p>Your comprehensive account details</p>
        </div>

        <div class="profile-grid">
            <!-- Left Column: Personal Info -->
            <div class="card profile-main-card">
                <div class="profile-header-area">
                    <div class="profile-photo-large">
                        ${profile.profile_photo ? `<img src="${CONFIG.API_BASE_URL}/storage/${profile.profile_photo}" alt="Profile">` : `
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        `}
                    </div>
                    <div>
                        <h2>${profile.first_name} ${profile.last_name}</h2>
                        <p class="status-badge">${profile.student_type}</p>
                    </div>
                </div>

                <div class="info-group">
                    <h3>Personal Information</h3>
                    <div class="info-grid">
                        <div class="info-item"><label>Email</label><p>${user.email}</p></div>
                        <div class="info-item"><label>Phone</label><p>${profile.country_code} ${profile.mobile_number}</p></div>
                        <div class="info-item"><label>DOB</label><p>${profile.date_of_birth}</p></div>
                        <div class="info-item"><label>Gender</label><p>${profile.gender}</p></div>
                        <div class="info-item"><label>Nationality</label><p>${profile.nationality}</p></div>
                        <div class="info-item"><label>Address</label><p>${profile.address_line1}, ${profile.city}, ${profile.state}, ${profile.country}</p></div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Academic, Affiliation, Project -->
            <div class="profile-details-column">
                <div class="card">
                    <h3>Academic History</h3>
                    ${academic && academic.length > 0 ? academic.map(edu => `
                        <div class="detail-item">
                            <div class="detail-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path></svg></div>
                            <div class="detail-content">
                                <strong>${edu.degree_title} (${edu.degree_level})</strong>
                                <p>${edu.institute_name} | Grade: ${edu.grade_value}</p>
                            </div>
                        </div>
                    `).join('') : '<p>No academic records found.</p>'}
                </div>

                <div class="card">
                    <h3>Current Affiliation</h3>
                    ${affiliation ? `
                        <div class="detail-item">
                            <div class="detail-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                            <div class="detail-content">
                                <strong>${affiliation.position_role}</strong>
                                <p>${affiliation.affiliated_organization} | ${affiliation.current_affiliation}</p>
                            </div>
                        </div>
                    ` : '<p>No affiliation records found.</p>'}
                </div>

                <div class="card">
                    <h3>Project Information</h3>
                    ${projects && projects.length > 0 ? projects.map(proj => `
                        <div class="detail-item">
                            <div class="detail-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>
                            <div class="detail-content">
                                <strong>${proj.project_title || 'Untitled Project'}</strong>
                                <p>Institute: ${proj.institute ? proj.institute.name : 'N/A'}</p>
                                <p>Supervisor: ${proj.supervisor ? proj.supervisor.name : 'N/A'}</p>
                            </div>
                        </div>
                    `).join('') : '<p>No project records found.</p>'}
                </div>
            </div>
        </div>
    `;
}

function getAdminSection(user, data) {
    const { users, roles, permissions } = data;
    const isSuperAdmin = user.roles && user.roles.includes('super_admin');

    return `
        <div class="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Manage system access, roles, and permissions</p>
        </div>

        <!-- Admin Tabs -->
        <div class="admin-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--gray-200); padding-bottom: 0.5rem;">
            <button class="nav-tab active" data-tab="users">Users</button>
            <button class="nav-tab" data-tab="roles">Roles</button>
            <button class="nav-tab" data-tab="permissions">Permissions</button>
        </div>

        <!-- Users Tab Content -->
        <div id="usersTab" class="tab-content">
            <div class="admin-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="card" style="text-align: center;">
                    <h4 style="color: var(--gray-500);">Total Users</h4>
                    <h2 style="font-size: 2rem; color: var(--primary-600);">${users ? users.length : 0}</h2>
                </div>
                <div class="card" style="text-align: center;">
                    <h4 style="color: var(--gray-500);">Pending Approvals</h4>
                    <h2 style="font-size: 2rem; color: var(--warning);">${users ? users.filter(u => !u.email_verified_at).length : 0}</h2>
                </div>
                <div class="card" style="text-align: center;">
                    <h4 style="color: var(--gray-500);">System Status</h4>
                    <h2 style="font-size: 2rem; color: var(--success);">Healthy</h2>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>System Users</h3>
                    <div class="search-box">
                        <input type="text" placeholder="Search users..." class="form-input" style="width: 250px;">
                    </div>
                </div>
                
                <div class="table-container" style="overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; border-bottom: 2px solid var(--gray-100);">
                                <th style="padding: 1rem;">User</th>
                                <th style="padding: 1rem;">Email</th>
                                <th style="padding: 1rem;">Roles</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users && users.length > 0 ? users.map(u => `
                                <tr style="border-bottom: 1px solid var(--gray-50);">
                                    <td style="padding: 1rem;"><strong>${u.username}</strong></td>
                                    <td style="padding: 1rem;">${u.email}</td>
                                    <td style="padding: 1rem;">
                                        ${u.roles.map(r => `<span class="badge badge-info">${r.name}</span>`).join(' ')}
                                    </td>
                                    <td style="padding: 1rem;">
                                        <span class="badge ${u.email_verified_at ? 'badge-success' : 'badge-warning'}">
                                            ${u.email_verified_at ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <button class="btn btn-sm btn-outline" onclick="openRoleAssignmentModal(${u.id}, '${u.username}', ${JSON.stringify(u.roles).replace(/"/g, '&quot;')})">Manage</button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No users found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Roles Tab Content -->
        <div id="rolesTab" class="tab-content" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3>System Roles</h3>
                <button class="btn btn-primary" onclick="openRoleModal()">+ Create New Role</button>
            </div>

            <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
                ${roles && roles.length > 0 ? roles.map(role => `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h4 style="margin: 0; font-size: 1.125rem;">${role.name}</h4>
                                <span class="badge badge-info" style="font-size: 0.75rem;">Level ${role.level}</span>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="openRoleModal(${JSON.stringify(role).replace(/"/g, '&quot;')})">Edit</button>
                        </div>
                        <p style="color: var(--gray-600); font-size: 0.875rem; min-height: 2.5rem;">${role.description || 'No description provided.'}</p>
                        <div style="margin-top: 1rem;">
                            <label style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--gray-500); display: block; margin-bottom: 0.5rem;">Permissions</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
                                ${role.permissions.map(p => `
                                    <span class="badge badge-success" style="font-size: 0.75rem;">${p.name.split('_').join(' ')}</span>
                                `).join('')}
                                ${role.permissions.length === 0 ? '<span style="color: var(--gray-400); font-size: 0.75rem italic;">No permissions</span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('') : '<p>No roles defined yet.</p>'}
            </div>
        </div>

        <!-- Permissions Tab Content -->
        <div id="permissionsTab" class="tab-content" style="display: none;">
            <h3>System Permissions</h3>
            <p style="color: var(--gray-600); margin-bottom: 2rem;">Permissions are grouped by their category. These are linked to specific system functions.</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                ${permissions ? Object.entries(permissions).map(([category, items]) => `
                    <div class="card">
                        <h4 style="text-transform: capitalize; border-bottom: 1px solid var(--gray-100); padding-bottom: 0.5rem; margin-bottom: 1rem;">${category}</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${items.map(p => `
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary-400);"></div>
                                    <div>
                                        <code style="font-weight: 600; color: var(--primary-700);">${p.slug}</code>
                                        <p style="margin: 0; font-size: 0.75rem; color: var(--gray-500);">${p.name}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('') : '<p>No permissions found.</p>'}
            </div>
        </div>

        <!-- Role Modal (Generic for Create/Edit) -->
        <div id="roleModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
            <div class="card" style="width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 id="roleModalTitle">Create New Role</h3>
                    <button class="btn btn-sm btn-outline" onclick="closeRoleModal()">Close</button>
                </div>
                <form id="roleForm">
                    <input type="hidden" id="roleId">
                    <div class="form-group">
                        <label class="form-label">Role Name *</label>
                        <input type="text" id="roleName" class="form-input" required placeholder="e.g. Project Lead">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role Slug *</label>
                        <input type="text" id="roleSlug" class="form-input" required placeholder="e.g. project_lead">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Hierarchy Level *</label>
                            <input type="number" id="roleLevel" class="form-input" required min="1" max="10" placeholder="1 is highest">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea id="roleDescription" class="form-input" style="min-height: 80px;"></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Assign Permissions</label>
                        <div id="modalPermissionList" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; max-height: 200px; overflow-y: auto; padding: 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; background: var(--gray-50);">
                            ${permissions ? Object.values(permissions).flat().map(p => `
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                                    <input type="checkbox" name="role_permissions" value="${p.id}">
                                    ${p.name}
                                </label>
                            `).join('') : 'Loading permissions...'}
                        </div>
                    </div>

                    <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary btn-block" id="roleSaveBtn">Save Role</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Role Assignment Modal -->
        <div id="roleAssignModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
            <div class="card" style="width: 100%; max-width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Manage User Roles</h3>
                    <button class="btn btn-sm btn-outline" onclick="closeRoleAssignModal()">Close</button>
                </div>
                <p>Assign roles to <strong id="assignTargetUser">User</strong></p>
                <form id="roleAssignForm">
                    <input type="hidden" id="assignUserId">
                    <div id="modalRoleList" style="margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; background: var(--gray-50); max-height: 200px; overflow-y: auto;">
                        ${roles ? roles.map(r => `
                            <div class="role-checkbox-item">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" name="user_roles" value="${r.id}" data-slug="${r.slug}" onchange="toggleRoleScope(this)">
                                    <span>${r.name}</span>
                                </label>
                                
                                <!-- Scoped Fields (Hidden by default) -->
                                <div id="scope_container_${r.id}" class="role-scope-fields" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem;">
                                    ${r.slug === 'department_lead' ? `
                                        <div class="form-group">
                                            <label style="font-size: 0.75rem;">Department Name</label>
                                            <input type="text" name="scope_dept_${r.id}" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" placeholder="e.g. IT">
                                        </div>
                                    ` : ''}
                                    ${r.slug === 'sub_department_lead' ? `
                                        <div class="form-group">
                                            <label style="font-size: 0.75rem;">Sub-Department Name</label>
                                            <input type="text" name="scope_subdept_${r.id}" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" placeholder="e.g. Networking">
                                        </div>
                                    ` : ''}
                                    ${r.slug === 'li_coordinator' ? `
                                        <div class="form-group">
                                            <label style="font-size: 0.75rem;">Institute Name</label>
                                            <input type="text" name="scope_inst_${r.id}" class="form-input" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" placeholder="e.g. IITB">
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('') : 'Loading roles...'}
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="assignSaveBtn">Save Changes</button>
                </form>
            </div>
        </div>
        <!-- Request Modal -->
        <div id="requestModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
            <div class="card" style="width: 100%; max-width: 500px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Submit New Request</h3>
                    <button class="btn btn-sm btn-outline" onclick="closeRequestModal()">Close</button>
                </div>
                <form id="newRequestForm">
                    <div class="form-group">
                        <label class="form-label">Request Type *</label>
                        <select id="req_type" class="form-input" required>
                            <option value="internship">Internship Request</option>
                            <option value="project">Project Collaboration</option>
                            <option value="access">Resource Access</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Target Department (Optional)</label>
                        <input type="text" id="req_dept" class="form-input" placeholder="e.g. IT Department">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Details *</label>
                        <textarea id="req_details" class="form-input" style="min-height: 120px;" required placeholder="Describe your request in detail..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="reqSubmitBtn">Submit Request</button>
                </form>
            </div>
        </div>
    `;
}

function getRequestsSection(user, requests = []) {
    return `
        <div class="dashboard-header">
            <h1>Requests Management</h1>
            <p>View and track your internship and project requests</p>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3>${user.roles && user.roles.some(r => r.level < 7) ? 'System Requests' : 'My Requests'}</h3>
                <button class="btn btn-primary" onclick="openRequestModal()">+ New Request</button>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            ${user.roles && user.roles.some(r => r.level < 7) ? '<th>Requester</th>' : ''}
                            <th>Type</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.length > 0 ? requests.map(req => `
                            <tr>
                                <td>#REQ-${req.id}</td>
                                ${user.roles && user.roles.some(r => r.level < 7) ? `<td>${req.user ? req.user.username : 'Unknown'}</td>` : ''}
                                <td><span class="badge badge-info">${req.type}</span></td>
                                <td>${req.department_id || 'Global'}</td>
                                <td>
                                    <span class="badge ${req.status === 'approved' ? 'badge-success' : (req.status === 'rejected' ? 'badge-danger' : 'badge-warning')}">
                                        ${req.status}
                                    </span>
                                </td>
                                <td>${new Date(req.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="viewRequestDetails(${JSON.stringify(req).replace(/"/g, '&quot;')})">View</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--gray-400);">No requests found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getSettingsSection(user) {
    return `
        <div class="dashboard-header">
            <h1>Account Settings</h1>
            <p>Manage your security and preferences</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="card">
                <h3 style="margin-bottom: 1.5rem;">Account Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Username</label>
                        <p>${user.username}</p>
                    </div>
                    <div class="info-item">
                        <label>Email Address</label>
                        <p>${user.email}</p>
                    </div>
                    <div class="info-item">
                        <label>Account Type</label>
                        <p>${user.roles ? user.roles.join(', ') : 'User'}</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 1.5rem;">Update Password</h3>
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label class="form-label" for="current_password">Current Password</label>
                        <input type="password" class="form-input" id="current_password" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="new_password">New Password</label>
                        <input type="password" class="form-input" id="new_password" minlength="8" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="confirm_password">Confirm New Password</label>
                        <input type="password" class="form-input" id="confirm_password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" id="passwordSubmitBtn">
                        Update Password
                    </button>
                </form>
                <div id="passwordMessage" style="margin-top: 1rem;"></div>
            </div>
        </div>
    `;
}
