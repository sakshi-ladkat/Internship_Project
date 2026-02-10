<?php
// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PreRegisterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Pre-registration routes
 */
Route::prefix('pre-register')->group(function () {
    // Send verification link
    Route::post('send-link', [PreRegisterController::class, 'sendVerificationLink'])
        ->name('send-verification-link');
    
    // Resend verification link
    Route::post('resend-link', [PreRegisterController::class, 'resendVerificationLink'])
        ->name('resend-verification-link');
});

/**
 * New Registration Routes (Multi-step)
 */
Route::prefix('registration')->group(function () {
    // Get institutes
    Route::get('institutes', [App\Http\Controllers\RegistrationController::class, 'getInstitutes'])
        ->name('registration.institutes');
    
    // Send email verification
    Route::post('send-verification', [App\Http\Controllers\RegistrationController::class, 'sendVerificationLink'])
        ->name('registration.send-verification');
    
    // Verify email (GET for email links)
    Route::get('verify-email', [App\Http\Controllers\RegistrationController::class, 'verifyEmail'])
        ->name('registration.verify-email');
    
    // Save registration data
    Route::post('save-data', [App\Http\Controllers\RegistrationController::class, 'saveRegistrationData'])
        ->name('registration.save-data');
    
    // Setup password page (GET for email links)
    Route::get('setup-password', [App\Http\Controllers\RegistrationController::class, 'setupPasswordPage'])
        ->name('registration.setup-password-page');
    
    // Set password (POST)
    Route::post('set-password', [App\Http\Controllers\RegistrationController::class, 'setPassword'])
        ->name('registration.set-password');
    
    // Get continents
    Route::get('continents', [App\Http\Controllers\RegistrationController::class, 'getContinents'])
        ->name('registration.continents');
    
    // Get countries by continent
    Route::post('countries', [App\Http\Controllers\RegistrationController::class, 'getCountriesByContinent'])
        ->name('registration.countries');
});



Route::post('create-account', [UserController::class, 'createAccount']);

// Get verified email from token
Route::post('get-verified-email', [UserController::class, 'getVerifiedEmail']);

// Check username availability
Route::post('check-username', [UserController::class, 'check']);

/**
 * Authentication routes
 */
Route::prefix('auth')->group(function () {
    // Login
    Route::post('login', [AuthController::class, 'login'])
        ->name('auth.login');
    
    // Logout
    Route::post('logout', [AuthController::class, 'logout'])
        ->name('auth.logout');
    
    // Get authenticated user
    Route::post('me', [AuthController::class, 'me'])
        ->name('auth.me');
    
    // Update profile
    Route::post('update-profile', [AuthController::class, 'updateProfile'])
        ->name('auth.update-profile');
    
    // Change password
    Route::post('change-password', [AuthController::class, 'changePassword'])
        ->name('auth.change-password');
});

/**
 * Profile management routes
 */
Route::prefix('profile')->group(function () {
    // Get complete profile
    Route::get('get-profile', [ProfileController::class, 'getProfile'])
        ->name('profile.get');
    
    // Save personal information
    Route::post('personal-info', [ProfileController::class, 'savePersonalInfo'])
        ->name('profile.personal-info');
    
    // Upload profile photo
    Route::post('upload-photo', [ProfileController::class, 'uploadProfilePhoto'])
        ->name('profile.upload-photo');
    
    // Save academic information
    Route::post('academic-info', [ProfileController::class, 'saveAcademicInfo'])
        ->name('profile.academic-info');
    
    // Save affiliation details
    Route::post('affiliation-info', [ProfileController::class, 'saveAffiliationInfo'])
        ->name('profile.affiliation-info');
    
    // Save project details
    Route::post('project-info', [ProfileController::class, 'saveProjectInfo'])
        ->name('profile.project-info');
    
    // Get master data
    Route::get('master-data', [ProfileController::class, 'getMasterData'])
        ->name('profile.master-data');
    
    // Get departments by institute
    Route::get('departments/{instituteId}', [ProfileController::class, 'getDepartmentsByInstitute'])
        ->name('profile.departments');
    
    // Get sub-departments by department
    Route::get('sub-departments/{departmentId}', [ProfileController::class, 'getSubDepartmentsByDepartment'])
        ->name('profile.sub-departments');
    
    // Get cities by state (for India)
    Route::get('cities/{state}', [ProfileController::class, 'getCitiesByState'])
        ->name('profile.cities');
});

/**
 * Admin Routes
 */
Route::prefix('admin')->group(function () {
    Route::get('users', [AdminController::class, 'getUsers'])->name('admin.users');
    Route::get('roles', [AdminController::class, 'getRoles'])->name('admin.roles');
    Route::get('permissions', [AdminController::class, 'getPermissions'])->name('admin.permissions');
    Route::post('save-role', [AdminController::class, 'saveRole'])->name('admin.save-role');
    Route::post('assign-roles', [AdminController::class, 'assignRoles'])->name('admin.assign-roles');
});

/**
 * Request Management Routes
 */
Route::prefix('requests')->group(function () {
    Route::post('store', [App\Http\Controllers\RequestController::class, 'store'])->name('requests.store');
    Route::get('user', [App\Http\Controllers\RequestController::class, 'userRequests'])->name('requests.user');
    Route::get('all', [App\Http\Controllers\RequestController::class, 'index'])->name('requests.all');
});

/**
 * SSH Key Management Routes
 */
Route::prefix('ssh-keys')->group(function () {
    Route::get('/', [App\Http\Controllers\SSHKeyController::class, 'index'])->name('ssh-keys.index');
    Route::post('/', [App\Http\Controllers\SSHKeyController::class, 'store'])->name('ssh-keys.store');
    Route::put('/{id}', [App\Http\Controllers\SSHKeyController::class, 'update'])->name('ssh-keys.update');
    Route::delete('/{id}', [App\Http\Controllers\SSHKeyController::class, 'destroy'])->name('ssh-keys.destroy');
});


/**
 * Alternative: If you want to use GET for email verification (more user-friendly for email links)
 * Uncomment the line below and adjust your VerificationMail to use this route
 */
// Route::get('verify-email', [PreRegisterController::class, 'verifyEmail'])
//     ->name('verify-email-get');