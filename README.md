# Health Tracking Website

A full-stack health tracking application with React.js frontend and Node.js backend, using Google Sheets as the database.

## Tech Stack

### Frontend
- React.js 18.2.0
- React Router for navigation
- Chart.js for data visualization
- Axios for API calls

### Backend
- Node.js + Express.js
- bcrypt for password hashing
- Google Sheets API for database
- Groq API for AI chatbot functionality

## Project Structure

```
health-tracker/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main App component
│   │   ├── index.js        # Entry point
│   │   └── *.css           # Stylesheets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── .env.example            # Environment variables template
└── README.md              # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Project with Google Sheets API enabled
- Groq API key

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd health-tracker

# Copy environment variables template
cp .env.example .env
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file with your actual API keys and configurations
```

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Configure Google Sheets API

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Download the JSON key file
5. Share your Google Sheet with the service account email
6. Update the .env file with your credentials:
   - `GOOGLE_SHEETS_API_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

### 5. Configure Groq API

1. Sign up for Groq API access
2. Get your API key
3. Update the .env file with `GROQ_API_KEY`

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
# For development with auto-reload:
npm run dev
```

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## User Roles

### Student
- View personal health metrics
- Track health history
- Chat with AI health assistant
- Manage appointments

### Doctor
- View patient lists
- Access patient health records
- Add medical notes
- View health analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students/:studentId/health` - Get student health data
- `POST /api/students/:studentId/health` - Add health record
- `GET /api/students/:studentId/profile` - Get student profile

### Doctors
- `GET /api/doctors/:doctorId/patients` - Get doctor's patients
- `GET /api/doctors/:doctorId/patients/:patientId/records` - Get patient records
- `POST /api/doctors/:doctorId/patients/:patientId/notes` - Add medical note

### Health
- `GET /api/health/metrics` - Get health metrics
- `POST /api/health/metrics` - Add health metric
- `GET /api/health/analytics` - Get health analytics

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI assistant
- `GET /api/chatbot/history/:userId` - Get chat history

## Development Notes

- The current implementation provides basic structure and routing
- Authentication is simplified for initial setup
- Google Sheets integration is marked as TODO and needs implementation
- Groq API integration is marked as TODO and needs implementation
- Chart.js integration is ready but needs actual data implementation

## Future Enhancements

- Complete authentication system with JWT
- Implement Google Sheets CRUD operations
- Integrate Groq API for AI chatbot
- Add Chart.js visualizations
- Implement real-time updates
- Add file upload for medical documents
- Implement email notifications
- Add mobile responsive design
