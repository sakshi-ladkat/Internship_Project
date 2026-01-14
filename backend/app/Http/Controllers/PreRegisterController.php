<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Models\PreUser;
use App\Models\User;

class PreRegisterController extends Controller
{
    public function sendVerificationLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email'
        ]);

        $token = Str::random(40);

        PreUser::updateOrCreate(
            ['email' => $request->email],
            ['token' => $token, 'is_verified' => false]
        );

        $link = url('/api/verify-email/'.$token);

        Mail::raw("Click to verify your email: $link", function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Verify Your Email');
        });

        return response()->json(['message' => 'Verification link sent']);
    }

    public function verifyEmail($token)
    {
        $pre = PreUser::where('token', $token)->first();

        if(!$pre){
            return response()->json(['message' => 'Invalid or expired link'], 400);
        }

        $pre->update(['is_verified' => true]);

        return response()->json(['message' => 'Email verified. You can register now']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required',
            'password' => 'required|min:6'
        ]);

        $pre = PreUser::where('email',$request->email)
                      ->where('is_verified',true)
                      ->first();

        if(!$pre){
            return response()->json(['message' => 'Email not verified'], 403);
        }

        User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'password'=>bcrypt($request->password)
        ]);

        return response()->json(['message'=>'Registered Successfully']);
    }
}
