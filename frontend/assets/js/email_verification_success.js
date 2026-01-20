/* ----------------------------------------
   Preserve verified email across pages
----------------------------------------- */
const params = new URLSearchParams(window.location.search);
const email = params.get('email');

if (!email) {
    // Safety fallback
    window.location.href =
      'verification_failed.html?reason=missing_email';
}

/* ----------------------------------------
   Button navigation with email
----------------------------------------- */
document.getElementById('createAccountBtn').onclick = function () {
    window.location.href =
        'create_account.html?email=' + encodeURIComponent(email);
};

document.getElementById('existingAccountBtn').onclick = function () {
    window.location.href =
        'existing_account.html?email=' + encodeURIComponent(email);
};