// Check if user is authenticated
function checkAuth() {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (!userId || !role || !username) {
    window.location.href = "/login.html";
    return null;
  }

  return {
    userId,
    role,
    username,
  };
}

// Export the auth check function
export { checkAuth };
