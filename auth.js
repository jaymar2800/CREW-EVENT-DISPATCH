// auth.js
const AUTH_KEY = "crew_app_logged_in";

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

// Simple demo login (NOT secure)
// Change these values:
const DEMO_USER = "admin";
const DEMO_PASS = "1234";

function login(username, password) {
  // basic check
  if (username === DEMO_USER && password === DEMO_PASS) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}
