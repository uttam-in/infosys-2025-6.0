# Quiz Generator App - Setup Guide

A full-stack AI-powered quiz generation application using FastAPI, React, and Google Gemini.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** (for backend)
- **Node.js 14+** and **npm** (for frontend)
- **Google Gemini API Key** (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Project Structure

```
quiz-generator/
├── backend/                 # FastAPI Python backend
│   ├── controllers/        # Business logic
│   ├── models/            # Pydantic models
│   ├── routes/            # API endpoints
│   ├── utils/             # Helper functions
│   ├── main.py            # FastAPI app entry
│   ├── database.py        # SQLite setup
│   └── requirements.txt   # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx       # Main app component
│   │   └── index.tsx     # Entry point
│   └── package.json      # Node dependencies
└── README.md
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
touch .env
```

Add your Google Gemini API key:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

**To get your API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and paste it into your `.env` file

### Step 5: Initialize Database

The database will be automatically created when you first run the app. If you need to manually initialize:

```bash
python -c "from database import init_db; init_db()"
```

### Step 6: Run Migration (if upgrading from older version)

If you're upgrading from a version without incomplete quiz tracking:

```bash
python migrate_quiz_tracking.py
```

### Step 7: Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a **new terminal** and navigate to the frontend:

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm start
```

The frontend will automatically open at http://localhost:3000

## Running the Application

### Quick Start (Both Servers)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Using the App

1. **Register/Login**
   - Open http://localhost:3000
   - Create a new account or login
   - You'll be redirected to the dashboard

2. **Generate a Quiz**
   - Click "Generate Quiz" in the navigation
   - Enter a topic (e.g., "Python Programming", "World History")
   - Select number of questions (3-15)
   - Click "Generate Quiz"

3. **Take the Quiz**
   - Answer questions by selecting options
   - Your progress is auto-saved
   - Submit when complete to see your score

4. **Resume Incomplete Quizzes**
   - Navigate to Dashboard
   - See incomplete quizzes with "Resume" button
   - Click "Resume" to continue where you left off

5. **View Statistics**
   - Dashboard shows:
     - Total quizzes taken
     - Average, highest, and lowest scores
     - Completed vs incomplete quizzes
     - Recent quiz attempts

## Features

### Core Features
- ✅ AI-powered quiz generation using Google Gemini
- ✅ User authentication (register/login/logout)
- ✅ Generate 3-15 multiple choice questions on any topic
- ✅ Interactive quiz interface with immediate feedback
- ✅ Auto-save progress for incomplete quizzes
- ✅ Resume incomplete quizzes from dashboard
- ✅ Performance tracking and statistics
- ✅ Visual charts and analytics

### Technical Features
- RESTful API with FastAPI
- SQLite database with context managers
- JWT-based authentication
- Structured LLM output with Pydantic validation
- React with TypeScript for type safety
- Responsive design for mobile and desktop
- CORS configured for local development

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Quiz Generation
- `POST /api/generate-questions` - Generate quiz questions

### Quiz Management
- `POST /api/quiz/save-attempt` - Save quiz attempt
- `PUT /api/quiz/update-attempt/{quiz_id}` - Update quiz progress
- `GET /api/quiz/attempt/{quiz_id}` - Get specific quiz attempt
- `GET /api/quiz/attempts` - Get all user's quiz attempts
- `GET /api/quiz/dashboard` - Get dashboard statistics

## Troubleshooting

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: Database errors**
```bash
# Delete and recreate database
rm auth.db
python -c "from database import init_db; init_db()"
```

**Issue: GOOGLE_API_KEY not found**
```bash
# Check .env file exists in backend/ directory
ls -la .env

# Verify content
cat .env

# Should show: GOOGLE_API_KEY=your_key_here
```

**Issue: Port 8000 already in use**
```bash
# Use a different port
uvicorn main:app --reload --port 8001

# Or kill the process using port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
```

### Frontend Issues

**Issue: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: Port 3000 already in use**
```bash
# The app will prompt to use a different port (3001)
# Or kill the process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

**Issue: CORS errors**
```bash
# Ensure backend is running on port 8000
# Check backend main.py has correct CORS configuration
# Frontend should be on http://localhost:3000
```

**Issue: API calls failing**
```bash
# Verify backend is running
curl http://localhost:8000/docs

# Check browser console for errors
# Verify token is stored in localStorage
```

### Common Issues

**Issue: Quiz generation fails**
- Check your Google API key is valid
- Ensure you have API quota remaining
- Check backend logs for detailed error messages

**Issue: Login/Register not working**
- Check backend server is running
- Verify database was initialized
- Check browser console for errors

**Issue: Resume button not showing**
- Run the migration script: `python backend/migrate_quiz_tracking.py`
- Refresh the dashboard

## Development Commands

### Backend
```bash
# Run tests
python test_api.py

# Check Python version
python --version

# List installed packages
pip list

# Format code (if using black)
black .
```

### Frontend
```bash
# Run tests
npm test -- --run

# Build for production
npm run build

# Check for outdated packages
npm outdated

# Type check
npx tsc --noEmit
```

## Production Deployment

### Backend
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build production bundle
npm run build

# Serve with a static server
npx serve -s build
```

## Environment Variables

### Backend (.env)
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Frontend (optional .env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API documentation at http://localhost:8000/docs
3. Check browser console and backend logs for errors

## License

This project is for educational purposes.
