<?php

use App\Http\Controllers\PreRegisterController;

Route::post('/send-verification-link',[PreRegisterController::class,'sendVerificationLink']);
Route::get('/verify-email/{token}',[PreRegisterController::class,'verifyEmail']);
Route::post('/register',[PreRegisterController::class,'register']);
