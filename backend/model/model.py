import os
import time
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
from collections import defaultdict, Counter

class EwasteDetector:
    def __init__(self, model_path='best.pt'):
        """
        Initialize the E-waste detector with YOLOv8 model
        
        Args:
            model_path: Path to the YOLOv8 model weights
        """
        # Check if model file exists, if not, use a default YOLOv8n model
        if not os.path.exists(model_path):
            print(f"Warning: Model not found at {model_path}. Using YOLOv8n model.")
            self.model = YOLO('yolov8n.pt')
        else:
            self.model = YOLO(model_path)
        
        # Labels for e-waste (will be overridden if custom model is loaded)
        self.labels = [
            'battery', 'circuit board', 'mobile', 'charger', 
            'adapter', 'laptop', 'keyboard', 'mouse'
        ]
        
        # Statistics tracking
        self.processed_count = 0
        self.detection_counts = defaultdict(int)
        self.processing_times = []
        self.total_detections = 0
    
    def detect(self, image_path, conf_threshold=0.25):
        """
        Detect e-waste objects in the image
        
        Args:
            image_path: Path to the image
            conf_threshold: Confidence threshold for detections
            
        Returns:
            List of detections with class, confidence, and bounding box
        """
        start_time = time.time()
        
        # Run inference
        results = self.model.predict(image_path, conf=conf_threshold)[0]
        
        # Process results
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            class_id = int(box.cls[0])
            
            # Get class name based on model's names or default labels
            if hasattr(results.names, 'get'):
                class_name = results.names.get(class_id, f"class_{class_id}")
            else:
                class_name = self.labels[class_id] if class_id < len(self.labels) else f"class_{class_id}"
            
            detections.append({
                'class': class_name,
                'confidence': round(conf, 2),
                'bbox': [x1, y1, x2, y2]
            })
            
            # Update statistics
            self.detection_counts[class_name] += 1
            self.total_detections += 1
        
        # Update processing time statistics
        end_time = time.time()
        processing_time = end_time - start_time
        self.processing_times.append(processing_time)
        self.processed_count += 1
        
        return detections
    
    def draw_boxes(self, image_path, output_path, detections=None):
        """
        Draw bounding boxes on the image and save it
        
        Args:
            image_path: Path to the input image
            output_path: Path to save the output image
            detections: List of detections (if None, will run detection)
            
        Returns:
            Path to the output image
        """
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image at {image_path}")
        
        # Run detection if not provided
        if detections is None:
            detections = self.detect(image_path)
        
        # Draw boxes and labels
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            class_name = det['class']
            confidence = det['confidence']
            
            # Generate random color for this class (consistent for same class)
            color_hash = hash(class_name) % 255
            color = (color_hash, 255 - color_hash, 127 + color_hash // 2)
            
            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            
            # Prepare label text
            label = f"{class_name} {confidence:.2f}"
            
            # Determine text size and background
            (label_width, label_height), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
            )
            
            # Ensure label is within image bounds
            y1 = max(y1, label_height + 5)
            
            # Draw label background
            cv2.rectangle(
                image, 
                (x1, y1 - label_height - 5), 
                (x1 + label_width, y1), 
                color, 
                -1
            )
            
            # Draw label text
            cv2.putText(
                image, 
                label, 
                (x1, y1 - 5), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.5, 
                (255, 255, 255), 
                1
            )
        
        # Save the output image
        cv2.imwrite(output_path, image)
        
        return output_path
    
    # Statistics methods
    def get_processed_count(self):
        """Get the number of processed images"""
        return self.processed_count
    
    def get_total_detections(self):
        """Get the total number of detections"""
        return self.total_detections
    
    def get_detection_breakdown(self):
        """Get breakdown of detections by class"""
        return dict(self.detection_counts)
    
    def get_avg_processing_time(self):
        """Get average processing time in seconds"""
        if not self.processing_times:
            return 0
        return sum(self.processing_times) / len(self.processing_times) 