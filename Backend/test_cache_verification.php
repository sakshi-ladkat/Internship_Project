<?php
/**
 * Test Script for Cache-Based Email Verification
 * 
 * This script demonstrates how the cache-based email verification works
 * Run this in tinker or as a test to verify the implementation
 */

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

// Example 1: Store verification data in cache
$email = 'test@example.com';
$token = Str::random(32);
$hashedToken = Hash::make($token);

$cacheKey = 'email_verification:' . $email;
Cache::put($cacheKey, [
    'email' => $email,
    'token' => $hashedToken,
    'status' => 'unverified',
    'created_at' => now()->toDateTimeString(),
    'expires_at' => now()->addMinutes(15)->toDateTimeString()
], now()->addMinutes(15));

echo "✓ Stored verification data in cache\n";
echo "Cache Key: {$cacheKey}\n";
echo "Token: {$token}\n\n";

// Example 2: Retrieve and verify
$verificationData = Cache::get($cacheKey);
if ($verificationData) {
    echo "✓ Retrieved verification data from cache\n";
    echo "Email: {$verificationData['email']}\n";
    echo "Status: {$verificationData['status']}\n";
    echo "Expires at: {$verificationData['expires_at']}\n\n";
}

// Example 3: Verify token
if (Hash::check($token, $verificationData['token'])) {
    echo "✓ Token verification successful\n\n";
    
    // Update to verified status
    $accountToken = Str::random(64);
    Cache::put($cacheKey, [
        'email' => $email,
        'token' => $accountToken,
        'status' => 'verified',
        'verified_at' => now()->toDateTimeString(),
        'expires_at' => now()->addHour()->toDateTimeString()
    ], now()->addHour());
    
    echo "✓ Updated status to verified\n";
    echo "New account token: {$accountToken}\n\n";
}

// Example 4: Check verified status
$verifiedData = Cache::get($cacheKey);
if ($verifiedData && $verifiedData['status'] === 'verified') {
    echo "✓ Email is verified and ready for account creation\n";
    echo "Account token: {$verifiedData['token']}\n\n";
}

// Example 5: Clear cache after account creation
Cache::forget($cacheKey);
echo "✓ Cache cleared after account creation\n";

// Verify cache is empty
if (!Cache::has($cacheKey)) {
    echo "✓ Cache entry successfully removed\n";
}
