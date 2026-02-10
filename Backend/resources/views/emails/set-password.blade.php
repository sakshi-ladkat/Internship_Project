<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set Your Password</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .content h2 {
            color: #667eea;
            margin-top: 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .button:hover {
            opacity: 0.9;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .warning {
            color: #e74c3c;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Set Your Password</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $name }}!</h2>
            
            <p>Congratulations! Your registration has been successfully completed.</p>
            
            <p>To complete your account setup and start using our platform, please set your password by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ $link }}" class="button">Set My Password</a>
            </div>
            
            <div class="info-box">
                <strong>📌 Important:</strong>
                <ul style="margin: 10px 0;">
                    <li>This link will expire in <strong>24 hours</strong></li>
                    <li>Your password must be at least 8 characters long</li>
                    <li>Choose a strong password with a mix of letters, numbers, and symbols</li>
                </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{ $link }}</p>
            
            <p class="warning">⚠️ If you didn't register for an account, please ignore this email or contact our support team.</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Your Application. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
