const express = require("express");
const path = require("path");
const connection = require(path.join(__dirname, "../../database/db"));
const router = express.Router();

// Create profile
router.post("/", async (req, res) => {
  try {
    const { user_id, skills, interests, bio, is_public } = req.body;

    const query = `
            INSERT INTO profile (user_id, bio, interests, skills, is_public)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                bio = VALUES(bio),
                interests = VALUES(interests),
                skills = VALUES(skills),
                is_public = VALUES(is_public);
        `;

    const [result] = await connection
      .promise()
      .query(query, [user_id, bio, interests, skills, is_public]);

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: {
        user_id,
        bio,
        interests,
        skills,
        is_public,
      },
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save profile",
    });
  }
});

// Update profile
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { skills, interests, bio } = req.body;

    const query = `
            UPDATE profile
            SET skills = ?, interests = ?, bio = ?
            WHERE user_id = ?
        `;

    const [result] = await connection
      .promise()
      .query(query, [skills, interests, bio, userId]);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

// Get Profile
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
            SELECT p.*, u.first_name, u.last_name, u.role
            FROM profile p
            JOIN user u ON p.user_id = u.id
            WHERE p.user_id = ?
        `;

    const [results] = await connection.promise().query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
});

router.post("/profile", (req, res) => {
  const { userId, skills, interests, bio } = req.body;

  // Validate input
  if (!userId || !skills || !interests || !bio) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const query =
    "INSERT INTO profile (user_id, skills, interests, bio) VALUES (?, ?, ?, ?)";
  connection.query(query, [userId, skills, interests, bio], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error: " + err.message });
    }
    res
      .status(201)
      .json({ success: true, message: "Profile created successfully." });
  });
});

module.exports = router;
