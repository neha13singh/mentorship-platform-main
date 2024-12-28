const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// Log to check environment variables

const bodyParser = require('body-parser');
const cors = require('cors'); // If you're using CORS
const path = require('path'); // Import path module
const connection = require('../database/db'); // Adjust the path
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const mentorshipRoutes = require('./routes/mentorship');
// dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS if needed
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Mentorship Matching Platform API!'); // Simple message
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
