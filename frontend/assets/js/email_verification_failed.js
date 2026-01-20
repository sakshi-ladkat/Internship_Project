// Read ?reason= from URL
const url = new URL(window.location.href);
const reason = url.searchParams.get("reason");

const reasonBox = document.getElementById("reasonText");
const resendBtn = document.querySelector("button");

// Default
let message = "Verification failed.";

// Decide message based on reason
switch (reason) {
  case "not_found":
    message = "No matching record found for this email. Please register again.";
    break;

  case "expired":
    message = "Your verification link has expired. Please request a new verification link.";
    break;

  case "invalid":
    message = "The verification link is invalid. Please request a new link.";
    break;

  default:
    message = "Something went wrong. Please try again.";
}

reasonBox.textContent = message;

resendBtn.addEventListener("click", async () => {
    const email = params.get("email");

    if (!email) {
        showMessage("Email not found. Please go back and register again.", "error");
        return;
    }

    resendBtn.disabled = true;
    loadingEl.classList.add("show");

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
            showMessage("Verification link resent successfully! Check your email.", "success");
        } else {
            showMessage(data.message || "Failed to resend email. Try again later.", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage("Network error. Please try again.", "error");
    } finally {
        resendBtn.disabled = false;
        loadingEl.classList.remove("show");
    }
});
