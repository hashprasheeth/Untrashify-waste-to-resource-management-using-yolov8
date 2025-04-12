import os
import shutil
import argparse
import random
import json
import glob
from pathlib import Path
from PIL import Image
import numpy as np

def setup_args():
    parser = argparse.ArgumentParser(description='Prepare e-waste dataset for YOLOv8 training')
    parser.add_argument('--input-dir', type=str, required=True, help='Path to Kaggle e-waste dataset')
    parser.add_argument('--output-dir', type=str, default='datasets/ewaste', help='Output directory')
    parser.add_argument('--split', type=str, default='70,20,10', help='Train/val/test split percentages')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    return parser.parse_args()

def create_folders(output_dir):
    """Create YOLO dataset structure"""
    folders = [
        os.path.join(output_dir, 'train', 'images'),
        os.path.join(output_dir, 'train', 'labels'),
        os.path.join(output_dir, 'val', 'images'),
        os.path.join(output_dir, 'val', 'labels'),
        os.path.join(output_dir, 'test', 'images'),
        os.path.join(output_dir, 'test', 'labels')
    ]
    
    for folder in folders:
        os.makedirs(folder, exist_ok=True)
        print(f"Created directory: {folder}")
    
    return output_dir

def convert_annotation_to_yolo(annotation, img_width, img_height, class_mapping):
    """
    Convert annotation to YOLO format
    
    YOLO format: <class> <x_center> <y_center> <width> <height>
    All values are normalized to [0, 1]
    """
    yolo_annotations = []
    
    for item in annotation:
        # Extract coordinates and class
        x_min = item.get('x', 0)
        y_min = item.get('y', 0)
        width = item.get('width', 0)
        height = item.get('height', 0)
        class_name = item.get('class', '').lower().replace(' ', '_')
        
        # Check if class exists in mapping
        if class_name not in class_mapping:
            print(f"Warning: Class '{class_name}' not found in mapping. Skipping.")
            continue
        
        class_id = class_mapping[class_name]
        
        # Calculate center point and normalized dimensions
        x_center = (x_min + width / 2) / img_width
        y_center = (y_min + height / 2) / img_height
        norm_width = width / img_width
        norm_height = height / img_height
        
        # Clamp values to [0, 1]
        x_center = max(0, min(1, x_center))
        y_center = max(0, min(1, y_center))
        norm_width = max(0, min(1, norm_width))
        norm_height = max(0, min(1, norm_height))
        
        # Create YOLO annotation
        yolo_annotations.append(f"{class_id} {x_center} {y_center} {norm_width} {norm_height}")
    
    return yolo_annotations

def process_dataset(args):
    """Process Kaggle e-waste dataset for YOLOv8 training"""
    input_dir = args.input_dir
    output_dir = args.output_dir
    split = [float(x) / 100 for x in args.split.split(',')]
    
    # Set random seed
    random.seed(args.seed)
    
    # Create output folders
    create_folders(output_dir)
    
    # Define class mapping
    class_mapping = {
        'battery': 0,
        'circuit_board': 1,
        'mobile': 2,
        'charger': 3,
        'adapter': 4,
        'laptop': 5,
        'keyboard': 6,
        'mouse': 7
    }
    
    # List all images in dataset
    image_files = []
    for ext in ['jpg', 'jpeg', 'png']:
        image_files.extend(glob.glob(os.path.join(input_dir, f'**/*.{ext}'), recursive=True))
    
    # Check if we have images
    if not image_files:
        print(f"Error: No images found in {input_dir}")
        return
    
    print(f"Found {len(image_files)} image files")
    
    # Shuffle and split
    random.shuffle(image_files)
    
    split_indices = [
        0,
        int(len(image_files) * split[0]),
        int(len(image_files) * (split[0] + split[1])),
        len(image_files)
    ]
    
    dataset_splits = {
        'train': image_files[split_indices[0]:split_indices[1]],
        'val': image_files[split_indices[1]:split_indices[2]],
        'test': image_files[split_indices[2]:split_indices[3]]
    }
    
    # Process each split
    for split_name, files in dataset_splits.items():
        print(f"Processing {split_name} split ({len(files)} images)")
        
        for img_path in files:
            img_filename = os.path.basename(img_path)
            img_name, img_ext = os.path.splitext(img_filename)
            
            # Check for corresponding annotation file
            json_path = os.path.join(os.path.dirname(img_path), f"{img_name}.json")
            
            if not os.path.exists(json_path):
                print(f"Warning: No annotation found for {img_path}. Skipping.")
                continue
            
            # Read annotation
            with open(json_path, 'r') as f:
                try:
                    annotation = json.load(f)
                except json.JSONDecodeError:
                    print(f"Warning: Could not parse annotation for {img_path}. Skipping.")
                    continue
            
            # Get image dimensions
            try:
                with Image.open(img_path) as img:
                    img_width, img_height = img.size
            except Exception as e:
                print(f"Warning: Could not open image {img_path}. Skipping. Error: {e}")
                continue
            
            # Convert annotations to YOLO format
            yolo_annotations = convert_annotation_to_yolo(
                annotation, img_width, img_height, class_mapping
            )
            
            if not yolo_annotations:
                print(f"Warning: No valid annotations found for {img_path}. Skipping.")
                continue
            
            # Define output paths
            out_img_path = os.path.join(output_dir, split_name, 'images', img_filename)
            out_label_path = os.path.join(output_dir, split_name, 'labels', f"{img_name}.txt")
            
            # Copy image
            shutil.copy(img_path, out_img_path)
            
            # Write YOLO annotation
            with open(out_label_path, 'w') as f:
                f.write('\n'.join(yolo_annotations))
    
    # Create dataset.yaml file
    yaml_path = os.path.join(output_dir, 'data.yaml')
    with open(yaml_path, 'w') as f:
        yaml_content = {
            'train': os.path.join(output_dir, 'train', 'images'),
            'val': os.path.join(output_dir, 'val', 'images'),
            'test': os.path.join(output_dir, 'test', 'images'),
            'nc': len(class_mapping),
            'names': list(class_mapping.keys())
        }
        f.write('# YOLOv8 dataset config\n')
        for key, value in yaml_content.items():
            if key == 'names':
                f.write(f"{key}: {value}\n")
            else:
                f.write(f"{key}: {value}\n")
    
    print(f"Dataset prepared successfully!")
    print(f"Total images: {len(image_files)}")
    print(f"Train: {len(dataset_splits['train'])} images")
    print(f"Validation: {len(dataset_splits['val'])} images")
    print(f"Test: {len(dataset_splits['test'])} images")
    print(f"Dataset YAML: {yaml_path}")

def main():
    args = setup_args()
    process_dataset(args)

if __name__ == '__main__':
    main() 