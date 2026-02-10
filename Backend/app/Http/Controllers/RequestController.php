<?php

namespace App\Http\Controllers;

use App\Models\InternshipRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RequestController extends Controller
{
    /**
     * Submit a new request
     */
    public function store(Request $request)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        $request->validate([
            'type' => 'required|string',
            'details' => 'required|string',
            'department_id' => 'nullable|integer',
            'sub_department_id' => 'nullable|integer',
            'institute_id' => 'nullable|integer',
        ]);

        $internshipRequest = InternshipRequest::create([
            'user_id' => $userId,
            'type' => $request->type,
            'details' => $request->details,
            'status' => 'pending',
            'department_id' => $request->department_id,
            'sub_department_id' => $request->sub_department_id,
            'institute_id' => $request->institute_id,
        ]);

        return response()->json([
            'message' => 'Request submitted successfully',
            'request' => $internshipRequest
        ], 201);
    }

    /**
     * Get user's own requests
     */
    public function userRequests(Request $request)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        $requests = InternshipRequest::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return response()->json(['requests' => $requests]);
    }

    /**
     * Get requests for leads/admins
     */
    public function index(Request $request)
    {
        $userId = $this->getUserId($request);
        if (!$userId) return response()->json(['message' => 'Unauthorized'], 401);

        $user = User::with('roles')->find($userId);
        
        if ($user->isSuperAdmin()) {
            return response()->json(['requests' => InternshipRequest::with('user')->get()]);
        }

        // Logic for leads
        $scopedRequests = collect();
        foreach ($user->roles as $role) {
            $query = InternshipRequest::with('user');
            
            // If lead of institute
            if ($role->pivot->institute_id) {
                $query->where('institute_id', $role->pivot->institute_id);
            }
            // If lead of department
            if ($role->pivot->department_id) {
                $query->where('department_id', $role->pivot->department_id);
            }
            // If lead of sub-dept
            if ($role->pivot->sub_department_id) {
                $query->where('sub_department_id', $role->pivot->sub_department_id);
            }

            // Only add if there is a scope defined for this role
            if ($role->pivot->institute_id || $role->pivot->department_id || $role->pivot->sub_department_id) {
                 $scopedRequests = $scopedRequests->merge($query->get());
            }
        }

        return response()->json(['requests' => $scopedRequests->unique('id')->values()]);
    }

    private function getUserId(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        if (!$token) return null;
        return Cache::get('auth_token:' . $token);
    }
}
