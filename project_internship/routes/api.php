<?php
// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PreRegisterController;
use App\Http\Controllers\UserController;

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


Route::post('create-account', [UserController::class, 'createAccount']);

/**
 * Alternative: If you want to use GET for email verification (more user-friendly for email links)
 * Uncomment the line below and adjust your VerificationMail to use this route
 */
// Route::get('verify-email', [PreRegisterController::class, 'verifyEmail'])
//     ->name('verify-email-get');