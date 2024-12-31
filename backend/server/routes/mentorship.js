const express = require("express");
const path = require("path");
const connection = require(path.join(__dirname, "../../database/db"));
const router = express.Router();
// Fetch all mentors
router.get('/all-mentors', async (req, res) => {
  const query = `
    SELECT u.id, u.username, u.role, p.skills, p.interests, p.bio 
    FROM user u
    LEFT JOIN profile p ON u.id = p.user_id
    WHERE u.role = 'mentor'
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all mentors:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Fetch all mentees
router.get('/all-mentees', async (req, res) => {
  const query = `
    SELECT u.id, u.username, u.role, p.skills, p.interests, p.bio 
    FROM user u
    LEFT JOIN profile p ON u.id = p.user_id
    WHERE u.role = 'mentee'
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all mentees:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get All Users with Profiles // will be used for user discovery
router.get("/users/:UserId", (req, res) => {
  const { UserId } = req.params;
  const query = `
  SELECT DISTINCT u.id, u.username, u.role, p.skills, p.interests, p.bio 
  FROM user u
  LEFT JOIN profile p ON u.id = p.user_id
  WHERE p.is_public = TRUE 
  AND u.role = 'mentor'
  AND NOT EXISTS (
    SELECT 1 
    FROM mentor_request_list mrl 
    WHERE mrl.requestor_user_id = ?
    AND mrl.user_id = u.id
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM mentor_accepted_list mal 
    WHERE mal.mentor_user_id = u.id 
    AND mal.user_id = ?
  )
`;
  connection.query(query, [UserId, UserId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Send Mentorship Request // user discovery
router.post("/request", (req, res) => {
  const { user_id, requestor_user_id, message } = req.body;

  const query =
    'INSERT INTO mentor_request_list (user_id, requestor_user_id, message, status) VALUES (?, ?, ?, "pending")';
  connection.query(
    query,
    [user_id, requestor_user_id, message],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res
        .status(201)
        .json({ success: true, message: "Request sent successfully" });
    }
  );
});

// Get User's Mentorship Requests // mentor dashboard
router.get("/requests/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
        SELECT r.*, u.username as requestor_username, u.role as requestor_role
        FROM mentor_request_list r
        JOIN user u ON r.requestor_user_id = u.id 
        WHERE r.user_id = ? and r.status = 'pending'
    `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Get User's Sent Requests // mentee dashboard
router.get("/sent-requests/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
        SELECT r.*, u.username, u.role
        FROM mentor_request_list r
        JOIN user u ON r.user_id = u.id
        WHERE r.requestor_user_id = ? and r.status = 'pending'
    `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// cancel request
router.post("/cancel-request/:requestId", (req, res) => {
  const { requestId } = req.params;
  const query = "DELETE FROM mentor_request_list WHERE id = ?";
  connection.query(query, [requestId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(200)
      .json({ success: true, message: "Request cancelled successfully" });
  });
});

// Accept Mentorship Request // mentor dashboard
router.post("/accept", (req, res) => {
  const { requestId } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // First update the request status
    const updateQuery =
      'UPDATE mentor_request_list SET status = "accepted" WHERE id = ?';
    connection.query(updateQuery, [requestId], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          console.error("Error updating request:", err);
          res.status(500).json({ error: "Database error" });
        });
      }

      // Get the request details
      const getRequestQuery =
        "SELECT user_id, requestor_user_id FROM mentor_request_list WHERE id = ?";
      connection.query(getRequestQuery, [requestId], (err, requestResults) => {
        if (err || !requestResults.length) {
          return connection.rollback(() => {
            console.error("Error getting request details:", err);
            res.status(500).json({ error: "Database error" });
          });
        }

        // Add to accepted list
        const acceptQuery =
          "INSERT INTO mentor_accepted_list (user_id, mentor_user_id) VALUES (?, ?)";
        connection.query(
          acceptQuery,
          [requestResults[0].requestor_user_id, requestResults[0].user_id],
          (err) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error adding to accepted list:", err);
                res.status(500).json({ error: "Database error" });
              });
            }

            // Remove entry from mentor_request_list
            const deleteQuery =
              "DELETE FROM mentor_request_list WHERE id = ?";
            connection.query(deleteQuery, [requestId], (err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Error deleting request:", err);
                  res.status(500).json({ error: "Database error" });
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error("Error committing transaction:", err);
                    res.status(500).json({ error: "Database error" });
                  });
                }
                res.status(200).json({
                  success: true,
                  message: "Request accepted successfully",
                });
              });
            });
          }
        );
      });
    });
  });
});
// Reject Mentorship Request
// Reject Mentorship Request
router.post("/reject", (req, res) => {
  const { requestId } = req.body;

  const query = 'DELETE FROM mentor_request_list WHERE id = ?';
  connection.query(query, [requestId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(200)
      .json({ success: true, message: "Request rejected successfully" });
  });
});

// Get User's Accepted Mentors
router.get("/accepted-mentors/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
        SELECT m.*, u.username, u.role, p.bio, p.skills, p.interests
        FROM mentor_accepted_list m
        JOIN user u ON m.mentor_user_id = u.id
        LEFT JOIN profile p ON u.id = p.user_id
        WHERE m.user_id = ?
    `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Get User's Mentees
router.get("/mentees/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
        SELECT u.id, u.username, u.role, p.bio, p.skills, p.interests
        FROM mentor_accepted_list m
        JOIN user u ON m.user_id = u.id 
        LEFT JOIN profile p ON u.id = p.user_id
        WHERE m.mentor_user_id = ?
    `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Get User's Connections
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const query = "SELECT * FROM connections WHERE user_id = ?"; // Adjust the query as needed
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No connections found for this user." });
    }
    res.status(200).json(results);
  });
});

// Get Accepted Mentors for a Mentee
router.get("/accepted-mentors/:userId", (req, res) => {
  const { userId } = req.params;
  const query = `
        SELECT m.*, u.username, u.role, p.bio, p.skills, p.interests
        FROM mentor_accepted_list m
        JOIN user u ON m.mentor_user_id = u.id
        LEFT JOIN profile p ON u.id = p.user_id
        WHERE m.user_id = ?
    `;
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

// remove mentor from accepted list
router.post("/remove-mentor/:userId/:mentorUserId", (req, res) => {
  const { userId, mentorUserId } = req.params;
  const query =
    "DELETE FROM mentor_accepted_list WHERE user_id = ? AND mentor_user_id = ?";
  connection.query(query, [userId, mentorUserId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res
      .status(200)
      .json({ success: true, message: "Mentor removed successfully" });
  });
});

// remove mentee from accepted list
router.post("/remove-mentee/:mentorUserId/:menteeUserId", (req, res) => {
  const { mentorUserId, menteeUserId } = req.params;
  const query =
    "DELETE FROM mentor_accepted_list WHERE user_id = ? AND mentor_user_id = ?";

  connection.query(query, [menteeUserId, mentorUserId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database error" });
    }
    // Additionally, delete from mentor_request_list where menteeUserId is requestor_user_id and mentorUserId is user_id
    const deleteRequestQuery =
      "DELETE FROM mentor_request_list WHERE requestor_user_id = ? AND user_id = ?";
    connection.query(
      deleteRequestQuery,
      [menteeUserId, mentorUserId],
      (err) => {
        if (err) {
          console.error("Error deleting request:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res
          .status(200)
          .json({ success: true, message: "Mentee removed successfully" });
      }
    );
  });
});


module.exports = router;
