<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PreRegistered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
   public function createAccount(Request $request)
{
    $request->validate([
        'token' => 'required',
        'password' => 'required|min:8|confirmed',
    ]);

    $pre = PreRegistered::where('token', $request->token)
        ->where('email_status', 'verified')
        ->whereNull('user_id')
        ->where('verification_expires_at', '>', now())
        ->first();

    if (!$pre) {
        return response()->json([
            'message' => 'Invalid or expired verification link.'
        ], 403);
    }

    $email = $pre->email;

    // Generate username safely
    $baseUsername = strtolower(explode('@', $email)[0]);
    $username = $baseUsername;
    $count = 1;

    while (User::where('username', $username)->exists()) {
        $username = $baseUsername . $count++;
    }

    $user = User::create([
        'email' => $email,
        'username' => $username,
        'password' => Hash::make($request->password),
    ]);

    $pre->update([
        'user_id' => $user->id
    ]);

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
    $pre = PreRegistered::where('token', $request->token)
        ->where('email_status', 'verified')
        ->firstOrFail();

    $baseUsername = explode('@', $pre->email)[0];

    return response()->json([
        'email' => $pre->email,
        'username' => $baseUsername
    ]);
}



}
