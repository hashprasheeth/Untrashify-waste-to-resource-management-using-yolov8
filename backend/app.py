import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64
import json
import time
from pathlib import Path

# Import YOLO model (to be implemented in model.py)
from model.model import EwasteDetector

app = Flask(__name__, static_folder='static')
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(app.static_folder, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Initialize detector
detector = EwasteDetector(model_path='model/best.pt')

# E-waste recycling suggestions
recycling_suggestions = {
    'battery': [
        'Recycle at certified e-waste centers',
        'Many electronic stores offer battery recycling programs',
        'Never dispose of in regular trash due to hazardous materials'
    ],
    'circuit board': [
        'Contains valuable metals that can be recovered',
        'Donate to educational institutions for STEM projects',
        'Take to specialized e-waste recyclers'
    ],
    'charger': [
        'Check with manufacturer for take-back programs',
        'Recycle at e-waste collection events',
        'Can often be reused with other compatible devices'
    ],
    'mobile': [
        'Many carrier stores offer trade-in or recycling programs',
        'Donate working phones to charity organizations',
        'Remove personal data before recycling'
    ],
    'laptop': [
        'Many manufacturers have take-back programs',
        'Separate battery before recycling',
        'Consider donation if still functional'
    ],
    'adapter': [
        'Recycle with other electronic accessories',
        'Check if compatible with other devices before disposal',
        'E-waste collection sites accept these items'
    ]
}

# Creative reuse ideas
reuse_ideas = {
    'circuit board': [
        'Create decorative art or jewelry',
        'Use in STEM education projects',
        'Make coasters or wall art'
    ],
    'charger': [
        'Repurpose cables for cable management',
        'Use as plant ties in garden',
        'Convert to a keychain or cable organizer'
    ],
    'mobile': [
        'Repurpose as a dedicated music player',
        'Use as a home security camera',
        'Convert to a remote control for smart home devices'
    ],
    'laptop': [
        'Convert to a digital photo frame',
        'Use as a dedicated media server',
        'Repurpose as a kitchen cookbook display'
    ]
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'E-waste detection API is running'})

@app.route('/api/detect', methods=['POST'])
def detect_objects():
    # Check if image file is present in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if file extension is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
    
    try:
        # Save file temporarily
        filename = secure_filename(file.filename)
        timestamp = int(time.time())
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Process image with YOLO model
        results = detector.detect(filepath)
        
        # Process results and generate suggestions
        processed_results = []
        for detection in results:
            obj_class = detection['class']
            confidence = detection['confidence']
            
            # Get suggestions based on object class
            suggestions = []
            reuses = []
            
            # Convert class name to lowercase for matching
            obj_class_lower = obj_class.lower()
            
            # Find matching recycling suggestions
            for key in recycling_suggestions:
                if key in obj_class_lower:
                    suggestions = recycling_suggestions[key]
                    break
            
            # Find matching reuse ideas
            for key in reuse_ideas:
                if key in obj_class_lower:
                    reuses = reuse_ideas[key]
                    break
            
            processed_results.append({
                'class': obj_class,
                'confidence': confidence,
                'bbox': detection['bbox'],
                'recycling_suggestions': suggestions,
                'reuse_ideas': reuses
            })
        
        # Generate image with bounding boxes
        output_img_path = os.path.join(app.config['UPLOAD_FOLDER'], f"output_{unique_filename}")
        detector.draw_boxes(filepath, output_img_path, results)
        
        # Create response with URLs
        response = {
            'original_image': f"/api/images/{unique_filename}",
            'annotated_image': f"/api/images/output_{unique_filename}",
            'detections': processed_results,
            'timestamp': timestamp
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<filename>', methods=['GET'])
def get_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Calculate statistics based on processed images
    # In a real app, this would likely use a database
    total_detections = detector.get_total_detections()
    
    return jsonify({
        'total_processed_images': detector.get_processed_count(),
        'total_detections': total_detections,
        'detection_breakdown': detector.get_detection_breakdown(),
        'processing_time_avg': detector.get_avg_processing_time()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 