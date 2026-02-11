<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\InstituteController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\SSHKeyController;

Route::get('/', function () {
    return view('welcome');
});

/**
 * Authentication Routes
 */
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    Route::post('update-profile', [AuthController::class, 'updateProfile'])->name('auth.update-profile');
    Route::post('change-password', [AuthController::class, 'changePassword'])->name('auth.change-password');
});

/**
 * Registration Routes
 */
Route::prefix('registration')->group(function () {
    // Email verification
    Route::post('send-verification', [RegistrationController::class, 'sendVerificationLink'])->name('registration.send-verification');
    Route::post('resend-verification', [RegistrationController::class, 'resendVerificationLink'])->name('registration.resend-verification');
    Route::get('verify-email', [RegistrationController::class, 'verifyEmail'])->name('registration.verify-email');
    
    // Registration data
    Route::post('save-data', [RegistrationController::class, 'saveRegistrationData'])->name('registration.save-data');
    
    // Password setup
    Route::get('setup-password', [RegistrationController::class, 'setupPasswordPage'])->name('registration.setup-password-page');
    Route::post('set-password', [RegistrationController::class, 'setPassword'])->name('registration.set-password');
    
    // Draft management
    Route::post('save-draft', [RegistrationController::class, 'saveDraft'])->name('registration.save-draft');
    Route::post('get-draft', [RegistrationController::class, 'getDraft'])->name('registration.get-draft');
    Route::post('delete-draft', [RegistrationController::class, 'deleteDraft'])->name('registration.delete-draft');
    Route::post('list-drafts', [RegistrationController::class, 'listDrafts'])->name('registration.list-drafts');
});

/**
 * Institute Routes
 */
Route::prefix('institutes')->group(function () {
    Route::get('/', [InstituteController::class, 'index'])->name('institutes.index');
    Route::get('/{id}', [InstituteController::class, 'show'])->name('institutes.show');
});

/**
 * Location Routes (Continents & Countries)
 */
Route::prefix('locations')->group(function () {
    Route::get('continents', [LocationController::class, 'getContinents'])->name('locations.continents');
    Route::post('countries', [LocationController::class, 'getCountriesByContinent'])->name('locations.countries');
    Route::post('countries-by-name', [LocationController::class, 'getCountriesByContinentName'])->name('locations.countries-by-name');
});

/**
 * Profile Management Routes
 */
Route::prefix('profile')->group(function () {
    Route::get('get-profile', [ProfileController::class, 'getProfile'])->name('profile.get');
    Route::post('personal-info', [ProfileController::class, 'savePersonalInfo'])->name('profile.personal-info');
    Route::post('upload-photo', [ProfileController::class, 'uploadProfilePhoto'])->name('profile.upload-photo');
    Route::post('academic-info', [ProfileController::class, 'saveAcademicInfo'])->name('profile.academic-info');
    Route::post('affiliation-info', [ProfileController::class, 'saveAffiliationInfo'])->name('profile.affiliation-info');
    Route::post('project-info', [ProfileController::class, 'saveProjectInfo'])->name('profile.project-info');
    Route::get('master-data', [ProfileController::class, 'getMasterData'])->name('profile.master-data');
    Route::get('departments/{instituteId}', [ProfileController::class, 'getDepartmentsByInstitute'])->name('profile.departments');
    Route::get('sub-departments/{departmentId}', [ProfileController::class, 'getSubDepartmentsByDepartment'])->name('profile.sub-departments');
    Route::get('cities/{state}', [ProfileController::class, 'getCitiesByState'])->name('profile.cities');
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
    Route::post('store', [RequestController::class, 'store'])->name('requests.store');
    Route::get('user', [RequestController::class, 'userRequests'])->name('requests.user');
    Route::get('all', [RequestController::class, 'index'])->name('requests.all');
});

/**
 * SSH Key Management Routes
 */
Route::prefix('ssh-keys')->group(function () {
    Route::get('/', [SSHKeyController::class, 'index'])->name('ssh-keys.index');
    Route::post('/', [SSHKeyController::class, 'store'])->name('ssh-keys.store');
    Route::put('/{id}', [SSHKeyController::class, 'update'])->name('ssh-keys.update');
    Route::delete('/{id}', [SSHKeyController::class, 'destroy'])->name('ssh-keys.destroy');
});