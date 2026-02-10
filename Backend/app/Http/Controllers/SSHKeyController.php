<?php

namespace App\Http\Controllers;

use App\Models\SSHKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SSHKeyController extends Controller
{
    /**
     * Get all SSH keys for authenticated user
     */
    public function index(Request $request)
    {
        $userId = $request->input('user_id');
        
        if (!$userId) {
            return response()->json([
                'message' => 'User ID is required.'
            ], 400);
        }

        $sshKeys = SSHKey::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'ssh_keys' => $sshKeys
        ]);
    }

    /**
     * Store a new SSH key
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'public_key' => 'required|string',
        ]);

        // Validate SSH key format (basic validation)
        if (!$this->isValidSSHKey($request->public_key)) {
            return response()->json([
                'message' => 'Invalid SSH public key format.'
            ], 422);
        }

        // Generate fingerprint
        $fingerprint = SSHKey::generateFingerprint($request->public_key);

        // Check if key already exists
        if (SSHKey::where('fingerprint', $fingerprint)->exists()) {
            return response()->json([
                'message' => 'This SSH key already exists.'
            ], 409);
        }

        // Create SSH key
        $sshKey = SSHKey::create([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'public_key' => $request->public_key,
            'fingerprint' => $fingerprint,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'SSH key added successfully.',
            'ssh_key' => $sshKey
        ], 201);
    }

    /**
     * Update SSH key
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $sshKey = SSHKey::where('id', $id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$sshKey) {
            return response()->json([
                'message' => 'SSH key not found.'
            ], 404);
        }

        $sshKey->update($request->only(['name', 'is_active']));

        return response()->json([
            'message' => 'SSH key updated successfully.',
            'ssh_key' => $sshKey
        ]);
    }

    /**
     * Delete SSH key
     */
    public function destroy(Request $request, $id)
    {
        $userId = $request->input('user_id');

        if (!$userId) {
            return response()->json([
                'message' => 'User ID is required.'
            ], 400);
        }

        $sshKey = SSHKey::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$sshKey) {
            return response()->json([
                'message' => 'SSH key not found.'
            ], 404);
        }

        $sshKey->delete();

        return response()->json([
            'message' => 'SSH key deleted successfully.'
        ]);
    }

    /**
     * Validate SSH public key format
     */
    private function isValidSSHKey($key)
    {
        // Basic validation for SSH public key
        // Should start with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, etc.
        $validPrefixes = ['ssh-rsa', 'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'];
        
        foreach ($validPrefixes as $prefix) {
            if (strpos($key, $prefix) === 0) {
                return true;
            }
        }
        
        return false;
    }
}
