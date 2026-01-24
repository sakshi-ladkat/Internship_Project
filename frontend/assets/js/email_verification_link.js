// Get email from query string
const params = new URLSearchParams(window.location.search);
const userEmail = params.get("email");

if (userEmail) {
    document.getElementById("userEmail").textContent = decodeURIComponent(userEmail);
}

// Resend email API call
async function resendEmail() {
    const email = params.get("email");

    if (!email) {
        alert("Email not found. Please go back and register again.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/pre-register/resend-link", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Verification link resent successfully! Check your email.");
        } else {
            alert(data.message || "Failed to resend email. Try again later.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Network error. Please try again.");
    }
}

document.getElementById('resendBtn').onclick = function () {
    resendEmail(userEmail);
};
