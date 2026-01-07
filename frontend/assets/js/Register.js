function register(){
    let email = document.getElementById("email").value;
    let msg = document.getElementById("message");

    if(email.trim() === ""){
        msg.style.color = "red";
        msg.innerHTML = "Please enter an email address.";
        return;
    }

    // Simple Email Validation
    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!pattern.test(email)){
        msg.style.color = "red";
        msg.innerHTML = "Please enter a valid email address.";
        return;
    }

    msg.style.color = "green";
    msg.innerHTML = "Registration link has been sent to your email.";