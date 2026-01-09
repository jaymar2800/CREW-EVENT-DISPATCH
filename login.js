// login.js
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, go to app
  if (isLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const errorBox = document.getElementById("errorBox");
  const demoBtn = document.getElementById("demoBtn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const ok = login(userEl.value.trim(), passEl.value);

    if (ok) {
      window.location.href = "index.html";
    } else {
      errorBox.textContent = "Invalid username or password.";
    }
  });

  demoBtn.addEventListener("click", () => {
    userEl.value = "admin";
    passEl.value = "1234";
  });
});
