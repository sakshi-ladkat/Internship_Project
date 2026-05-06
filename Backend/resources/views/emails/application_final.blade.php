<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; }
        .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #111; }
        .details { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #bae6fd; }
        .footer { font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Application Fully Approved</div>
        <p>Dear {{ $applicantName }},</p>
        <p>Your application has been fully approved by all authorities and your account has been activated.</p>
        
        <div class="details">
            <p><strong>Application ID:</strong> {{ $applicationId }}</p>
            <p><strong>Status:</strong> Account Activated</p>
        </div>
        
        <p>You can now log in to the <strong>OrbitAccess Dashboard</strong> to access your approved services.</p>
        <p>Note: If you have requested cluster services, please ensure you upload your SSH key through the portal.</p>
        
        <div class="footer">
            Best Regards,<br><strong>OrbitAccess Team</strong><br><br>
            This is an automated notification. Please do not reply directly to this email.
        </div>
    </div>
</body>
</html>