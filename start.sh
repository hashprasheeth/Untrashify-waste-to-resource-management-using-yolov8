#!/bin/bash

echo "Starting Trashify - E-waste Detection App..."

echo "======================================"
echo "Setting up the backend server"
echo "======================================"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing backend dependencies..."
pip install -r requirements.txt
echo ""

echo "======================================"
echo "Starting the backend server..."
echo "======================================"
# Start backend in background
python app.py &
BACKEND_PID=$!
cd ..

echo "======================================"
echo "Setting up the frontend application"
echo "======================================"
cd frontend
echo "Installing frontend dependencies..."
npm install
echo ""

echo "======================================"
echo "Starting the frontend development server..."
echo "======================================"
npm start

# Cleanup function to kill background processes when script exits
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    exit
}

# Register cleanup function to be called on exit
trap cleanup EXIT

echo "======================================"
echo "Trashify is now running!"
echo "Backend server: http://localhost:5000"
echo "Frontend application: http://localhost:3000"
echo "======================================" 