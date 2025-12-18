@echo off
REM 🚀 Imarisha Loan - Local Development Startup Script (Windows)
REM This script sets up and starts both backend and frontend locally

echo.
echo 🚀 Starting Imarisha Loan Development Environment...
echo.

REM ============================================================================
REM BACKEND SETUP
REM ============================================================================
echo 📍 Setting up Backend...
cd backend

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt

REM Initialize database
if not exist "imarisha.db" (
    echo Initializing database...
    flask db upgrade
)

REM Seed database
echo Seeding database with test data...
python seed.py

echo ✓ Backend ready

REM Start backend in new window
echo Starting backend server...
start "Imarisha Backend" python run.py

echo ✓ Backend running on http://localhost:5000
echo.

REM ============================================================================
REM FRONTEND SETUP
REM ============================================================================
echo 📍 Setting up Frontend...
cd ..\frontend

REM Install dependencies
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install -q
)

echo ✓ Frontend ready

REM Start frontend
echo Starting frontend dev server...
start "Imarisha Frontend" npm run dev

echo ✓ Frontend running on http://localhost:5173
echo.

REM ============================================================================
REM SUMMARY
REM ============================================================================
echo ================================
echo ✅ DEVELOPMENT ENVIRONMENT STARTED!
echo ================================
echo.
echo 📊 ENDPOINTS:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:5173 or http://localhost:3000
echo.
echo 🔑 TEST CREDENTIALS:
echo    Admin:        admin / admin123
echo    Loan Officer: james.mutua / officer123
echo    Field Officer: field.john.kipchoge / officer123
echo    Customer:     member.0.0 / customer123
echo.
echo 📚 Documentation:
echo    LOCAL_SETUP.md - Complete setup guide
echo    CHANGES_SUMMARY.md - What was changed
echo.
echo ⚡ Notes:
echo    - Backend running in separate window
echo    - Frontend running in separate window
echo    - Close windows to stop servers
echo    - Check LOCAL_SETUP.md for troubleshooting
echo.
pause

