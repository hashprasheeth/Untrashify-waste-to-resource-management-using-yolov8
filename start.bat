@echo off
echo Starting Trashify - E-waste Detection App...

echo ======================================
echo Setting up the backend server
echo ======================================
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing backend dependencies...
pip install -r requirements.txt
echo.

echo ======================================
echo Starting the backend server...
echo ======================================
start cmd /k "call venv\Scripts\activate && python app.py"
cd ..

echo ======================================
echo Setting up the frontend application
echo ======================================
cd frontend
echo Installing frontend dependencies...
npm install
echo.

echo ======================================
echo Starting the frontend development server...
echo ======================================
npm start

echo ======================================
echo Trashify is now running!
echo Backend server: http://localhost:5000
echo Frontend application: http://localhost:3000
echo ====================================== 