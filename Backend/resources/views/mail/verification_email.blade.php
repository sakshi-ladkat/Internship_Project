{{-- resources/views/emails/verification.blade.php --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <link rel="stylesheet" href="verification_email.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
            <p>Complete your registration</p>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div class="button-container">
                <a href="{{ $verificationLink }}" class="button">Verify Email Address</a>
            </div>
            
            <div class="info-box">
                <strong> This link expires in {{ $expiresInMinutes }} minutes.</strong><br>
                If you don't verify your email within this time, you'll need to request a new verification link.
            </div>
            
            <p>After verifying your email, you will be able to:</p>
            <ul>
                <li>Create a new account</li>
                <li>Register this email with an existing account</li>
                <li>Access all features of our platform</li>
            </ul>
            
            <p>If you did not request this verification, please ignore this email. Your email address will not be registered unless you click the verification link.</p>
            
            <div class="alternative-link">
                <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                <p><a href="{{ $verificationLink }}">{{ $verificationLink }}</a></p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Security Notice:</strong> Never share this email or verification link with anyone.</p>
            <p>© {{ date('Y') }} Your Application. All rights reserved.</p>
            <p><a href="{{ config('app.url') }}" style="color: #667eea; text-decoration: none;">Visit our website</a></p>
        </div>
    </div>
</body>
</html>