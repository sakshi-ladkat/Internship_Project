<?php

namespace App\Http\Controllers;

use App\Models\Institute;
use App\Models\RegistrationData;
use App\Models\User;
use App\Mail\SetPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RegistrationController extends Controller
{
    /**
     * Get all active institutes
     */
    public function getInstitutes()
    {
        $institutes = Institute::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'country', 'city']);

        return response()->json([
            'institutes' => $institutes
        ]);
    }

    /**
     * Send email verification link
     */
    public function sendVerificationLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255'
        ]);

        $email = $request->email;

        // Check if email already exists in users table
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message' => 'Email is already registered.'
            ], 409);
        }

        // Check if email already has a pending registration
        $existingRegistration = RegistrationData::where('email', $email)
            ->whereIn('status', ['email_verified', 'password_set'])
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'Email already has a pending registration.'
            ], 409);
        }

        // Generate verification token
        $token = Str::random(64);
        $hashedToken = Hash::make($token);

        // Store in cache (15 minutes)
        $cacheKey = 'email_verification:' . $email;
        Cache::put($cacheKey, [
            'email' => $email,
            'token' => $hashedToken,
            'status' => 'unverified',
            'created_at' => now()->toDateTimeString(),
            'expires_at' => now()->addMinutes(15)->toDateTimeString()
        ], now()->addMinutes(15));

        // Generate verification link
        $verificationLink = url('/api/registration/verify-email?token=' . $token . '&email=' . urlencode($email));

        \Log::info('Generated Verification Link: ' . $verificationLink);

        // Send email
        try {
            Mail::to($email)->send(new \App\Mail\VerificationMail($verificationLink));
            
            return response()->json([
                'message' => 'Verification link sent successfully! Please check your email.',
                'email' => $email
            ]);
        } catch (\Exception $e) {
            \Log::error('Verification email failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }
    }

    /**
     * Verify email from link
     */
    public function verifyEmail(Request $request)
    {
        $email = $request->query('email');
        $token = $request->query('token');

        if (!$email || !$token) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?error=invalid');
        }

        $cacheKey = 'email_verification:' . $email;
        $verificationData = Cache::get($cacheKey);

        if (!$verificationData) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?error=expired');
        }

        if ($verificationData['status'] === 'verified') {
            // Email already verified, redirect with existing session token
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?token=' . $verificationData['token'] . '&email=' . urlencode($email) . '&message=already_verified');
        }

        if (now()->isAfter(Carbon::parse($verificationData['expires_at']))) {
            Cache::forget($cacheKey);
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?error=expired');
        }

        if (!Hash::check($token, $verificationData['token'])) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?error=invalid');
        }

        // Generate session token for registration
        $sessionToken = Str::random(64);

        // Update cache with verified status
        Cache::put($cacheKey, [
            'email' => $email,
            'token' => $sessionToken,
            'status' => 'verified',
            'verified_at' => now()->toDateTimeString(),
            'expires_at' => now()->addHour()->toDateTimeString()
        ], now()->addHour());

        // Redirect to registration form with token
        return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/multi-step-register?token=' . $sessionToken . '&email=' . urlencode($email));
    }

    /**
     * Save registration data (multi-step)
     */
    public function saveRegistrationData(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'institute_id' => 'required|exists:institutes,id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'address_line3' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'continent' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'office_country_code' => 'required|string|max:10',
            'office_city_code' => 'nullable|string|max:10',
            'office_number' => 'required|string|max:20',
            'fax_number' => 'nullable|string|max:20',
        ]);

        // Verify token
        $cacheKey = 'email_verification:' . $request->email;
        $verificationData = Cache::get($cacheKey);

        // Debug logging
        \Log::info('Registration submission - Email: ' . $request->email);
        \Log::info('Registration submission - Received token: ' . $request->token);
        \Log::info('Registration submission - Cache data: ' . json_encode($verificationData));

        if (!$verificationData) {
            \Log::error('Registration failed: No verification data in cache for ' . $request->email);
            return response()->json([
                'message' => 'Invalid or expired verification token.',
                'debug' => 'No verification data found'
            ], 403);
        }

        if ($verificationData['status'] !== 'verified') {
            \Log::error('Registration failed: Email not verified. Status: ' . ($verificationData['status'] ?? 'null'));
            return response()->json([
                'message' => 'Invalid or expired verification token.',
                'debug' => 'Email not verified'
            ], 403);
        }

        if ($verificationData['token'] !== $request->token) {
            \Log::error('Registration failed: Token mismatch');
            \Log::error('Expected: ' . $verificationData['token']);
            \Log::error('Received: ' . $request->token);
            return response()->json([
                'message' => 'Invalid or expired verification token.',
                'debug' => 'Token mismatch'
            ], 403);
        }

        // Check if email already registered
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'Email is already registered.'
            ], 409);
        }

        // Create or update registration data
        $registrationData = RegistrationData::updateOrCreate(
            ['email' => $request->email],
            [
                'institute_id' => $request->institute_id,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'address_line3' => $request->address_line3,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'continent' => $request->continent,
                'country' => $request->country,
                'office_country_code' => $request->office_country_code,
                'office_city_code' => $request->office_city_code,
                'office_number' => $request->office_number,
                'fax_number' => $request->fax_number,
                'status' => 'email_verified',
                'email_verified_at' => now(),
            ]
        );

        // Generate password setup token
        $passwordToken = Str::random(64);
        $hashedPasswordToken = Hash::make($passwordToken);

        // Store password setup token in cache (24 hours)
        $passwordCacheKey = 'password_setup:' . $request->email;
        Cache::put($passwordCacheKey, [
            'email' => $request->email,
            'token' => $hashedPasswordToken,
            'registration_id' => $registrationData->id,
            'expires_at' => now()->addHours(24)->toDateTimeString()
        ], now()->addHours(24));

        // Send password setup email
        $passwordSetupLink = url('/api/registration/setup-password?token=' . $passwordToken . '&email=' . urlencode($request->email));

        try {
            Mail::to($request->email)->send(new SetPasswordMail($passwordSetupLink, $registrationData->full_name));
            
            // Clear verification cache
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'Registration successful! Please check your email to set your password.',
                'registration_id' => $registrationData->id
            ]);
        } catch (\Exception $e) {
            \Log::error('Password setup email failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Registration saved but failed to send password setup email. Please contact support.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify password setup token and show password form
     */
    public function setupPasswordPage(Request $request)
    {
        $email = urldecode($request->query('email'));
        $token = $request->query('token');

        if (!$email || !$token) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/login?error=invalid');
        }

        $cacheKey = 'password_setup:' . $email;
        $setupData = Cache::get($cacheKey);

        if (!$setupData) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/login?error=expired');
        }

        if (now()->isAfter(Carbon::parse($setupData['expires_at']))) {
            Cache::forget($cacheKey);
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/login?error=expired');
        }

        if (!Hash::check($token, $setupData['token'])) {
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/login?error=invalid');
        }

        // Redirect to password setup page with token
        return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5500/frontend') . '/index.html#/setup-password?token=' . $token . '&email=' . urlencode($email));
    }

    /**
     * Set password and create user account
     */
    public function setPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $cacheKey = 'password_setup:' . $request->email;
        $setupData = Cache::get($cacheKey);

        if (!$setupData || !Hash::check($request->token, $setupData['token'])) {
            return response()->json([
                'message' => 'Invalid or expired password setup token.'
            ], 403);
        }

        if (now()->isAfter(Carbon::parse($setupData['expires_at']))) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Password setup token has expired.'
            ], 403);
        }

        // Get registration data
        $registrationData = RegistrationData::find($setupData['registration_id']);

        if (!$registrationData) {
            return response()->json([
                'message' => 'Registration data not found.'
            ], 404);
        }

        // Check if user already exists
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'User account already exists. Please login.'
            ], 409);
        }

        // Generate username
        $baseUsername = strtolower(explode('@', $request->email)[0]);
        $username = $baseUsername;
        $count = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $count++;
        }

        // Create user account
        $user = User::create([
            'email' => $request->email,
            'username' => $username,
            'password' => Hash::make($request->password),
            'institute_id' => $registrationData->institute_id,
            'email_verified_at' => now(),
        ]);

        // Update registration data
        $registrationData->update([
            'user_id' => $user->id,
            'status' => 'completed',
            'password_set_at' => now(),
        ]);

        // Create user profile from registration data
        $user->profile()->create([
            'first_name' => $registrationData->first_name,
            'middle_name' => $registrationData->middle_name,
            'last_name' => $registrationData->last_name,
            'address_line1' => $registrationData->address_line1,
            'address_line2' => $registrationData->address_line2,
            'address_line3' => $registrationData->address_line3,
            'city' => $registrationData->city,
            'state' => $registrationData->state,
            'postal_code' => $registrationData->postal_code,
            'country' => $registrationData->country,
        ]);

        // Clear cache
        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Password set successfully! You can now login.',
            'user_id' => $user->id,
            'username' => $username
        ]);
    }

    /**
     * Get continents list
     */
    public function getContinents()
    {
        $continents = [
            'Africa',
            'Antarctica',
            'Asia',
            'Europe',
            'North America',
            'Oceania',
            'South America'
        ];

        return response()->json([
            'continents' => $continents
        ]);
    }

    /**
     * Get countries by continent
     */
    public function getCountriesByContinent(Request $request)
    {
        $request->validate([
            'continent' => 'required|string'
        ]);

        // This is a simplified version. In production, use a proper countries database
        $countriesByContinent = [
            'Africa' => ['Algeria', 'Egypt', 'Kenya', 'Nigeria', 'South Africa'],
            'Antarctica' => ['Antarctica'],
            'Asia' => ['China', 'India', 'Japan', 'Singapore', 'South Korea', 'Thailand'],
            'Europe' => ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom'],
            'North America' => ['Canada', 'Mexico', 'United States'],
            'Oceania' => ['Australia', 'New Zealand', 'Fiji'],
            'South America' => ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Peru']
        ];

        $countries = $countriesByContinent[$request->continent] ?? [];

        return response()->json([
            'countries' => $countries
        ]);
    }
}
