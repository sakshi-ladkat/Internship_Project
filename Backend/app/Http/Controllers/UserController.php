<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PreRegistered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class UserController extends Controller
{
    public function createAccount(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        // Get verified email from cache using the token
        $email = null;
        $cacheKey = null;

        // Search through cache to find the email associated with this token
        // Note: In production, you might want to use a more efficient approach
        // such as storing token->email mapping separately
        foreach (Cache::get('email_verification_tokens', []) as $storedEmail => $storedToken) {
            if ($storedToken === $request->token) {
                $email = $storedEmail;
                $cacheKey = 'email_verification:' . $email;
                break;
            }
        }

        // If not found in token mapping, try to get from request or session
        if (!$email) {
            // Alternative: Check if token is passed with email parameter
            if ($request->has('email')) {
                $email = $request->email;
                $cacheKey = 'email_verification:' . $email;
            } else {
                return response()->json([
                    'message' => 'Invalid or expired verification token.'
                ], 403);
            }
        }

        // Get verification data from cache
        $verificationData = Cache::get($cacheKey);

        if (!$verificationData || 
            $verificationData['status'] !== 'verified' || 
            $verificationData['token'] !== $request->token) {
            return response()->json([
                'message' => 'Invalid or expired verification token.'
            ], 403);
        }

        // Check if token is expired
        if (now()->isAfter(Carbon::parse($verificationData['expires_at']))) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Verification token has expired.'
            ], 403);
        }

        // Check if user already exists
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message' => 'Email is already registered.'
            ], 409);
        }

        // Generate username safely
        $baseUsername = strtolower(explode('@', $email)[0]);
        $username = $baseUsername;
        $count = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $count++;
        }

        // Create user account
        $user = User::create([
            'email' => $email,
            'username' => $username,
            'password' => Hash::make($request->password),
        ]);

        // Create PreRegistered record to link verification to user
        PreRegistered::create([
            'email' => $email,
            'user_id' => $user->id,
            'email_status' => 'verified',
            'verified_at' => now(),
            'verification_expires_at' => now()->addYear(), // Keep record for reference
        ]);

        // Clear the cache entry
        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Account created successfully.',
            'user_id' => $user->id
        ], 201);
    }




    public function check(Request $request)
    {
        $request->validate([
            'username' => [
                'required',
                'regex:/^[a-zA-Z][a-zA-Z0-9._]{2,19}$/'
            ]
        ]);

        $username = strtolower($request->username);

        $exists = User::where('username', $username)->exists();

        if (!$exists) {
            return response()->json([
                'available' => true
            ]);
        }

        // If taken → generate suggestions
        return response()->json([
            'available' => false,
            'suggestions' => $this->generateSuggestions($username)
        ]);
    }

    private function generateSuggestions($username)
    {
        $suggestions = [];
        $base = preg_replace('/[^a-zA-Z0-9._]/', '', $username);

        for ($i = 1; $i <= 5; $i++) {
            $candidate = $base . rand(10, 99);

            if (!User::where('username', $candidate)->exists()) {
                $suggestions[] = $candidate;
            }
        }

        return $suggestions;
    }

public function getVerifiedEmail(Request $request)
{
    $request->validate([
        'token' => 'required'
    ]);

    // Search for the email associated with this token in cache
    $email = null;
    $cacheKey = null;

    // If email is provided in request, use it directly
    if ($request->has('email')) {
        $email = $request->email;
        $cacheKey = 'email_verification:' . $email;
        $verificationData = Cache::get($cacheKey);

        if ($verificationData && 
            $verificationData['status'] === 'verified' && 
            $verificationData['token'] === $request->token) {
            
            $baseUsername = explode('@', $email)[0];

            return response()->json([
                'email' => $email,
                'username' => $baseUsername
            ]);
        }
    }

    return response()->json([
        'message' => 'Invalid or expired verification token.'
    ], 403);
}



}
