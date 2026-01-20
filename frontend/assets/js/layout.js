function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load " + file);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error(error));
}

// Load header & footer
document.addEventListener("DOMContentLoaded", () => {
    loadComponent("header", "../components/header.html");
    loadComponent("footer", "../components/footer.html");
});


function showLoading() {
  const loader = document.getElementById("loading");
  if (loader) loader.style.display = "inline-block";
}

function hideLoading() {
  const loader = document.getElementById("loading");
  if (loader) loader.style.display = "none";
}

function showMessage(text, type = "success") {
  const messageBox = document.getElementById("message");
  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className = "message " + type; // success | error
  messageBox.style.display = "block";
}

function clearMessage() {
  const messageBox = document.getElementById("message");
  if (messageBox) {
    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
  }
}

