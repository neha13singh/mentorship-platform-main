const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path"); // Import the path module
const connection = require(path.join(__dirname, "../../database/db")); // Use path.join to create the absolute path
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  console.log(req.body); // Log the request body
  const { firstName, lastName, email, username, password, role } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    // Check if username or email already exists
    const checkUser = "SELECT * FROM user WHERE username = ? OR email = ?";
    connection.query(checkUser, [username, email], async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).json({
          success: false,
          message: "Database error: " + err.message,
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username or email already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        "INSERT INTO user (first_name, last_name, email, username, password, role) VALUES (?, ?, ?, ?, ?, ?)";

      // Execute the query
      connection.query(
        query,
        [firstName, lastName, email, username, hashedPassword, role],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return res.status(500).json({
              success: false,
              message: "Database error: " + err.message,
            });
          }
          res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
              id: results.insertId,
              username,
              email,
              role,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      success: false,
      message: "Unexpected server error: " + error.message,
    });
  }
});

// User Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const query = "SELECT * FROM user WHERE username = ?";
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      userId: user.id,
      role: user.role,
      username: user.username,
    });
  });
});

module.exports = router;
