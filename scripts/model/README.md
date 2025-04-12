# YOLO Model Training for E-waste Detection

This directory contains scripts for training the YOLOv8 model for e-waste detection.

## Prerequisites

- Processed e-waste dataset (see `scripts/data/README.md`)
- Python 3.8+ with dependencies installed:
  ```
  pip install ultralytics PyYAML
  ```

## Training the Model

Run the `train_yolo.py` script to train the model:

```
python train_yolo.py --data path/to/datasets/ewaste/data.yaml --epochs 100 --batch-size 16 --img-size 640 --model-size n --pretrained
```

### Command Line Arguments

- `--data`: Path to the data.yaml file generated during dataset preparation
- `--epochs`: Number of training epochs (default: 100)
- `--batch-size`: Batch size for training (default: 16)
- `--img-size`: Image size for training (default: 640)
- `--model-size`: YOLOv8 model size: n(ano), s(mall), m(edium), l(arge), x(large) (default: n)
- `--pretrained`: Use pretrained weights (optional)
- `--output-dir`: Output directory for training results (default: runs/train)

## Model Sizes

When choosing a model size, consider the following tradeoffs:

| Model | Parameters | Speed | Memory Usage | Accuracy |
|-------|------------|-------|-------------|----------|
| YOLOv8n | 3.2M | Fastest | Lowest | Good |
| YOLOv8s | 11.2M | Fast | Low | Better |
| YOLOv8m | 25.9M | Medium | Medium | Very Good |
| YOLOv8l | 43.7M | Slow | High | Excellent |
| YOLOv8x | 68.2M | Slowest | Highest | Best |

For e-waste detection with limited computational resources, YOLOv8n or YOLOv8s is recommended. For higher accuracy, use YOLOv8m or larger if resources allow.

## Training Process

1. The script will download pretrained weights (if `--pretrained` is used)
2. Train the model for the specified number of epochs
3. Evaluate the model on the validation set
4. Export the model to ONNX format for deployment

## Output

After training, you'll find the following in the output directory:

- `best.pt`: Best model weights based on validation metrics
- `last.pt`: Weights from the last epoch
- Training metrics and logs
- Model exports in various formats

## Using the Trained Model

Copy the `best.pt` file to the `backend/model/` directory to use it with the e-waste detection app:

```
cp runs/train/ewaste_yolov8n/weights/best.pt ../../backend/model/
``` 