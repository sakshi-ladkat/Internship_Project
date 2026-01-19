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
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Check verified + within 1 hour window
        $pre = PreRegistered::where('email', $request->email)
            ->where('email_status', 'verified')
            ->whereNull('user_id')
            ->where('verification_expires_at', '>', now())
            ->first();

        if (!$pre) {
            return response()->json([
                'message' => 'Email verification expired or invalid. Please verify again.'
            ], 403);
        }

        // Auto-generate username from email
        $baseUsername = explode('@', $request->email)[0];
        $username = $baseUsername;
        $count = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $count++;
        }

        // Create user
        $user = User::create([
            'email' => $request->email,
            'username' => $username,
            'password' => Hash::make($request->password),
        ]);

        // Link verified email to user
        $pre->update([
            'user_id' => $user->id
        ]);

        return response()->json([
            'message' => 'Account created successfully.',
            'user_id' => $user->id
        ], 201);
    }
}
