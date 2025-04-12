import os
import argparse
import yaml
from ultralytics import YOLO

def setup_args():
    parser = argparse.ArgumentParser(description='Train YOLOv8 model for e-waste detection')
    parser.add_argument('--data', type=str, default='data.yaml', help='Path to the data.yaml file')
    parser.add_argument('--epochs', type=int, default=100, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16, help='Batch size')
    parser.add_argument('--img-size', type=int, default=640, help='Image size')
    parser.add_argument('--model-size', type=str, default='n', 
                        choices=['n', 's', 'm', 'l', 'x'], 
                        help='YOLOv8 model size: n(ano), s(mall), m(edium), l(arge), x(large)')
    parser.add_argument('--pretrained', action='store_true', help='Use pretrained weights')
    parser.add_argument('--output-dir', type=str, default='runs/train', help='Output directory')
    return parser.parse_args()

def create_data_yaml(data_dir, output_yaml='data.yaml'):
    """
    Create data.yaml file for YOLOv8 training
    
    Args:
        data_dir: Directory containing train, val, test folders
        output_yaml: Path to save the YAML file
    """
    # Define e-waste classes
    classes = [
        'battery', 'circuit_board', 'mobile', 'charger', 
        'adapter', 'laptop', 'keyboard', 'mouse'
    ]
    
    # Create YAML content
    data = {
        'train': os.path.join(data_dir, 'train', 'images'),
        'val': os.path.join(data_dir, 'val', 'images'),
        'test': os.path.join(data_dir, 'test', 'images'),
        'nc': len(classes),
        'names': classes
    }
    
    # Write YAML file
    with open(output_yaml, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)
    
    print(f"Created data YAML file at {output_yaml}")
    return output_yaml

def train_yolo(args):
    """
    Train YOLOv8 model for e-waste detection
    
    Args:
        args: Command line arguments
    """
    # Choose YOLOv8 model size
    model_name = f'yolov8{args.model_size}'
    
    # Load model
    if args.pretrained:
        model = YOLO(f'{model_name}.pt')
        print(f"Loaded pretrained model: {model_name}.pt")
    else:
        model = YOLO(f'{model_name}.yaml')
        print(f"Initialized new model: {model_name}.yaml")
    
    # Train the model
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        batch=args.batch_size,
        imgsz=args.img_size,
        project=args.output_dir,
        name=f'ewaste_yolov8{args.model_size}'
    )
    
    # Evaluate the model
    metrics = model.val()
    print(f"Validation metrics: {metrics}")
    
    # Export the model to ONNX format for deployment
    model.export(format='onnx')
    
    print(f"Training completed. Model saved at {args.output_dir}/ewaste_yolov8{args.model_size}")
    return results

def main():
    args = setup_args()
    train_yolo(args)

if __name__ == '__main__':
    main() 