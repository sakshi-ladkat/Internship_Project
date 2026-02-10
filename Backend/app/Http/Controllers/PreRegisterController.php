<?php
// app/Http/Controllers/PreRegisterController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PreRegistered;
use App\Models\User;
use App\Mail\VerificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\RateLimiter;

class PreRegisterController extends Controller
{
    public function sendVerificationLink(Request $request)
    {
        // Rate limiting: max 3 requests per minute per IP
        $key = 'pre-register:' . $request->ip().':'.$request->email;
        
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'message' => 'Too many verification requests. Please try again later.'
            ], 429); // Too Many Requests
        }

        RateLimiter::hit($key, 60); // 60 seconds decay

        // Validate email
        $request->validate([
            'email' => 'required|email|max:255'
        ]);

        $email = $request->email;

        // Check if user already exists in the system
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return response()->json([
                'message' => 'Email is already registered.'
            ], 409); // Conflict
        }

        // Check if email is already verified and linked to a user
        $existingRecord = PreRegistered::where('email', $email)
            ->where('email_status', 'verified')
            ->whereNotNull('user_id')
            ->first();

        if ($existingRecord) {
            return response()->json([
                'message' => 'Email is already verified and registered.'
            ], 409);
        }

        // Generate a random verification token (32 characters)
        $token = Str::random(32);
        
        // Hash the token before storing
        $hashedToken = Hash::make($token);

        // Store verification data in cache (15 minutes TTL)
        $cacheKey = 'email_verification:' . $email;
        Cache::put($cacheKey, [
            'email' => $email,
            'token' => $hashedToken,
            'status' => 'unverified',
            'created_at' => now()->toDateTimeString(),
            'expires_at' => now()->addMinutes(15)->toDateTimeString()
        ], now()->addMinutes(15));

        // Generate verification link
        $verificationLink = route('verify-email', [
            'token' => $token,
            'email' => urlencode($email)
        ]);

        // Send verification email
        try {
            Mail::to($email)->send(new VerificationMail($verificationLink));
            
            return response()->json([
                'message' => 'Verification link sent successfully! Please check your email.',
                'email' => $email
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Verification email failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $email = urldecode($request->query('email'));
        $token = $request->query('token');

        if (!$email || !$token) {
            return redirect('http://127.0.0.1:5500/frontend/index.html#/register?error=invalid');
        }

        // Get verification data from cache
        $cacheKey = 'email_verification:' . $email;
        $verificationData = Cache::get($cacheKey);

        if (!$verificationData) {
            return redirect('http://127.0.0.1:5500/frontend/index.html#/register?error=not_found');
        }

        // Check if already verified
        if ($verificationData['status'] === 'verified') {
            return redirect('http://127.0.0.1:5500/frontend/index.html#/login?message=already_verified');
        }

        // Check if expired
        if (now()->isAfter(Carbon::parse($verificationData['expires_at']))) {
            Cache::forget($cacheKey);
            return redirect('http://127.0.0.1:5500/frontend/index.html#/register?error=expired');
        }

        // Verify token
        if (!Hash::check($token, $verificationData['token'])) {
            return redirect('http://127.0.0.1:5500/frontend/index.html#/register?error=invalid');
        }

        // Generate a new token for account creation
        $accountToken = Str::random(64);

        // Update cache with verified status and new token (valid for 1 hour)
        Cache::put($cacheKey, [
            'email' => $email,
            'token' => $accountToken,
            'status' => 'verified',
            'verified_at' => now()->toDateTimeString(),
            'expires_at' => now()->addHour()->toDateTimeString()
        ], now()->addHour());

        // Redirect to SPA verification success page with token
        return redirect('http://127.0.0.1:5500/frontend/index.html?token=' . $accountToken . '#/verification-success');
    }

    public function resendVerificationLink(Request $request)
    {
        // Rate limiting: max 2 resend requests per 10 minutes per IP
        $key = 'resend-verification:' . $request->ip().':'.$request->email;
        
        if (RateLimiter::tooManyAttempts($key, 2)) {
            return response()->json([
                'message' => 'Too many resend requests. Please try again in 10 minutes.'
            ], 429);
        }

        RateLimiter::hit($key, 600); // 600 seconds (10 minutes) decay

        $request->validate([
            'email' => 'required|email|max:255'
        ]);

        $email = $request->email;
        
        // Check cache for existing verification request
        $cacheKey = 'email_verification:' . $email;
        $verificationData = Cache::get($cacheKey);

        if (!$verificationData) {
            // Don't reveal if email exists for security
            return response()->json([
                'message' => 'If this email exists, a verification link will be sent.'
            ], 200);
        }

        if ($verificationData['status'] === 'verified') {
            return response()->json([
                'message' => 'This email is already verified.'
            ], 409);
        }

        // Generate new token
        $token = Str::random(32);
        $hashedToken = Hash::make($token);

        // Update cache with new token (30 minutes TTL)
        Cache::put($cacheKey, [
            'email' => $email,
            'token' => $hashedToken,
            'status' => 'unverified',
            'created_at' => now()->toDateTimeString(),
            'expires_at' => now()->addMinutes(30)->toDateTimeString()
        ], now()->addMinutes(30));

        $verificationLink = route('verify-email', [
            'token' => $token,
            'email' => urlencode($email)
        ]);

        try {
            Mail::to($email)->send(new VerificationMail($verificationLink));
            
            return response()->json([
                'message' => 'Verification link sent successfully!'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Resend verification email failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }
    }
}