# Mentorship Matching Platform

Welcome to the Mentorship Matching Platform! This platform connects mentors and mentees, facilitating meaningful connections for personal and professional growth.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and authentication
- Profile setup and editing
- Mentor and mentee dashboards
- Sending and managing mentorship requests
- Viewing accepted mentors and mentees
- Responsive design

## Project Structure
# Mentorship Matching Platform

Welcome to the Mentorship Matching Platform! This platform connects mentors and mentees, facilitating meaningful connections for personal and professional growth.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and authentication
- Profile setup and editing
- Mentor and mentee dashboards
- Sending and managing mentorship requests
- Viewing accepted mentors and mentees
- Responsive design

## Project Structure

.
├── backend/               
│   ├── .env                     
│   ├── .gitignore               
│   ├── database/                
│   │   ├── db.js                
│   │   ├── setup.js             
│   │   └── sql.js               
│   ├── package.json             
│   └── server/                  
│       ├── index.js             
│       └── routes/              
│           ├── auth.js          
│           ├── mentorship.js    
│           └── profile.js       
├── frontend/                   
│   ├── package.json             
│   └── public/                  
│       ├── api.js               
│       ├── commons/             
│       │   ├── auth.js          
│       │   └── config.js        
│       ├── edit-profile.html    
│       ├── index.html           
│       ├── login.html           
│       ├── mentee-dashboard.html
│       ├── mentor-dashboard.html
│       ├── profile-setup.html   
│       ├── profile.html         
│       └── styles.css           
└── README.md                    


## Installation

### Backend

1. Navigate to the `backend` directory:
   ```sh
   cd backend
   npm install

2. Set up the database:
   ```sh
   node database/setup.js
3. Start the backend server
   ```sh
   npm run dev

## Frontend
4. Navigate to the frontend directory
   ```sh
   npm install
5. Create a .env file in the frontend directory and add the following environment variable:
   ```sh
   API_BASE_URL=http://localhost:3000
   
## How to Use the Platform

1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start the server.
2. Run 
3. Register as a new user and complete your profile setup.
4. Log in to access your dashboard.
5. Explore the features of the platform, such as:
   - Sending mentorship requests.
   - Managing your connections.

## API Endpoints
### Authentication
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`

### Profile
- **Create/Update Profile**: `POST /api/profile`
- **Get Profile**: `GET /api/profile/:userId`
- **Update Profile**: `PUT /api/profile/:userId`

### Mentorship
- **Get All Users**: `GET /api/mentorship/users/:UserId`
- **Send Mentorship Request**: `POST /api/mentorship/request`
- **Get Mentorship Requests**: `GET /api/mentorship/requests/:userId`
- **Get Sent Requests**: `GET /api/mentorship/sent-requests/:userId`
- **Cancel Request**: `POST /api/mentorship/cancel-request/:requestId`
- **Accept Request**: `POST /api/mentorship/accept`
- **Reject Request**: `POST /api/mentorship/reject`
- **Get Accepted Mentors**: `GET /api/mentorship/accepted-mentors/:userId`
- **Get Mentees**: `GET /api/mentorship/mentees/:userId`
- **Remove Mentor**: `POST /api/mentorship/remove-mentor/:userId/:mentorUserId`
- **Remove Mentee**: `POST /api/mentorship/remove-mentee/:mentorUserId/:menteeUserId`

## Environment Variables
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

### JWT Secret
JWT_SECRET=your-jwt-secret-key

### Backend Server Port
PORT=your-port-number

### API Base URL
REACT_APP_API_BASE_URL=your-api-base-url


