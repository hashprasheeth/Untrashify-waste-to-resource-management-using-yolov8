# Trashify - E-waste Detection App

Welcome to Trashify, an application that detects e-waste items in uploaded images using YOLO object detection, providing recycling suggestions and creative reuse ideas.

## Project Overview

This application consists of:

1. **Flask Backend**: Handles image processing and e-waste object detection using YOLOv8
2. **React Frontend**: Provides a user interface for image uploads and displaying detection results
3. **Data Processing Scripts**: Prepares the Kaggle e-waste dataset for training
4. **Model Training Scripts**: Trains a YOLOv8 model on the e-waste dataset

## Getting Started

### Prerequisites

- Python 3.8+ with pip
- Node.js and npm
- Git

### Setup Instructions

#### Clone the repository

```bash
git clone <repository-url>
cd trashify
```

#### Download the model (Option 1)

You can use a pre-trained YOLOv8 model:

```bash
mkdir -p backend/model
# The app will automatically download YOLOv8n if no model is found
```

#### Train your own model (Option 2)

1. Follow the instructions in `scripts/data/README.md` to download and prepare the Kaggle e-waste dataset
2. Follow the instructions in `scripts/model/README.md` to train the YOLOv8 model
3. Copy the best model to the backend directory:
```bash
copy D:\trashify-main\runs\train\ewaste_yolov8n\weights\best.pt D:\trashify-main\backend\model\
```

#### Start the application

On Windows:
```bash
start.bat
```

On Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

This will:
- Create a Python virtual environment
- Install backend dependencies
- Start the Flask backend server
- Install frontend dependencies
- Start the React frontend development server

#### Access the application

- Backend API: http://localhost:5000
- Frontend UI: http://localhost:3000

## Using the Application

1. Navigate to http://localhost:3000 in your web browser
2. Upload an image containing e-waste items
3. The application will detect objects like batteries, chargers, circuit boards, etc.
4. View the detection results with bounding boxes
5. Get recycling suggestions and creative reuse ideas for each detected item
6. Check the stats page to see statistics about the e-waste items detected

## Development

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Deployment

To deploy the application to a production environment:

1. Build the React frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set up a production WSGI server for Flask:
   ```bash
   cd backend
   pip install gunicorn  # On Windows, use waitress instead
   gunicorn -w 4 app:app
   ```

3. Configure a web server like Nginx to serve the static frontend files and proxy API requests to the backend

## Project Structure

```
trashify/
├── backend/                  # Flask backend
│   ├── model/                # YOLO model files
│   │   ├── __init__.py
│   │   └── model.py          # E-waste detector class
│   ├── static/               # Static files
│   │   └── uploads/          # Uploaded images
│   ├── app.py                # Main Flask application
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React frontend
│   ├── public/               # Public static files
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── App.js            # Main React app
│   │   └── index.js          # Entry point
│   └── package.json          # npm dependencies
├── scripts/                  # Utility scripts
│   ├── data/                 # Dataset preparation
│   │   ├── prepare_dataset.py
│   │   └── README.md
│   └── model/                # Model training
│       ├── train_yolo.py
│       └── README.md
├── start.bat                 # Windows startup script
├── start.sh                  # Linux/Mac startup script
└── README.md                 # Project documentation
``` 