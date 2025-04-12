# E-waste Dataset Preparation

This directory contains scripts for preparing the e-waste dataset for YOLO model training.

## Dataset Source

The dataset is sourced from Kaggle: [E-waste Dataset](https://www.kaggle.com/datasets/kaustubh2402/ewaste-dataset)

## Download Instructions

1. Sign up for a Kaggle account if you don't have one.
2. Install the Kaggle API: `pip install kaggle`
3. Generate an API token from your Kaggle account settings.
4. Place the `kaggle.json` file in the `~/.kaggle/` directory.
5. Make the file secure:
   ```
   chmod 600 ~/.kaggle/kaggle.json
   ```
6. Download the dataset:
   ```
   kaggle datasets download kaustubh2402/ewaste-dataset
   ```
7. Unzip the downloaded file:
   ```
   unzip ewaste-dataset.zip -d ewaste-dataset
   ```

## Dataset Preparation

Run the `prepare_dataset.py` script to process the dataset:

```
python prepare_dataset.py --input-dir path/to/ewaste-dataset --output-dir datasets/ewaste
```

This will:
1. Create the required directory structure
2. Split the dataset into train/val/test sets
3. Convert annotations to YOLO format
4. Generate a `data.yaml` file for training

## Expected Directory Structure

After processing, your dataset should have the following structure:

```
datasets/ewaste/
├── train/
│   ├── images/
│   │   ├── image1.jpg
│   │   └── ...
│   └── labels/
│       ├── image1.txt
│       └── ...
├── val/
│   ├── images/
│   │   ├── image1.jpg
│   │   └── ...
│   └── labels/
│       ├── image1.txt
│       └── ...
├── test/
│   ├── images/
│   │   ├── image1.jpg
│   │   └── ...
│   └── labels/
│       ├── image1.txt
│       └── ...
└── data.yaml
```

## YOLO Format

The annotations are converted to YOLO format:
- Each `.txt` file corresponds to an image
- Each line represents one object: `<class_id> <x_center> <y_center> <width> <height>`
- All values are normalized to [0, 1]

## Class Mapping

```
0: battery
1: circuit_board
2: mobile
3: charger
4: adapter
5: laptop
6: keyboard
7: mouse
``` 