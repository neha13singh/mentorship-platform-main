const API_BASE_URL = "https://mentorship-platform-main-backend.onrender.com/api"; // Base URL for API calls

// Function to register a user
async function registerUser(data) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Check if the response is OK (status in the range 200-299)
  if (!response.ok) {
    const errorText = await response.text(); // Get the error text
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const result = await response.json(); // Parse the JSON response
  console.log(result); // Log the result to see what is returned
  return result;
}

// Function to log in a user
async function loginUser(data) {
  console.log("Logging in with data:", data); // Log the data being sent
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json(); // Parse the JSON response
  console.log("API Response:", result); // Log the API response
  return result; // Ensure the result includes username
}

// Function to fetch users by role
async function fetchUsers(role) {
  const response = await fetch(`${API_BASE_URL}/mentorship/users/${role}`);
  return response.json();
}

// Function to save user profile
async function saveProfile(data) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Export functions for use in other files
export { registerUser, loginUser, fetchUsers, saveProfile };
