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

// (Optional) Resend button click handling
resendBtn.addEventListener("click", () => {
  alert("Here you can call your resend API");
  // Example:
  // fetch("http://127.0.0.1:8000/api/pre-register/resend-link", {...})
});