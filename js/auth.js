// ===== LOGOUT =====
function logoutUser() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// ===== AUTO REDIRECT =====
// If on app pages and NOT logged in → go to login
auth.onAuthStateChanged((user) => {
  const page     = window.location.pathname;
  const appPages = ['logger.html', 'history.html', 'map.html'];

  if (!user && appPages.some(p => page.includes(p))) {
    window.location.href = 'login.html';
  }
});