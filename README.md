# Sole — Know before it shows

Sole is a computer vision–based foot health monitoring system designed to identify early signs of diabetic foot ulcers. It combines a lightweight deep learning model with a simple, user-facing web interface to provide risk scores, visual heatmaps, and actionable insights.

The goal is early intervention. Most diabetic foot complications develop silently over time, and timely detection can significantly reduce the risk of severe outcomes such as infections or amputations.

---

## Overview

The system takes an image of the plantar surface of the foot and predicts ulcer severity across four grades. It outputs:

* An overall risk score
* Zone-wise risk distribution (heel, ball, arch, toe)
* A visual heatmap highlighting high-risk regions
* Basic recommendations based on observed patterns

The application is designed to be accessible, requiring only a standard smartphone camera and no specialized hardware.

---

## Architecture

The system consists of three main components:

1. **Model training pipeline**
   A convolutional neural network based on MobileNetV2 is trained on a labeled dataset of plantar images categorized into four severity grades.

2. **Backend (Flask API)**
   Handles inference, preprocessing, and response generation. It also manages patient data, scan history, and contextual responses for the assistant.

3. **Frontend (React + Tailwind)**
   Provides a minimal interface for scanning, viewing results, tracking history, and interacting with the system.

The full pipeline—from dataset to inference—is illustrated in the architecture diagram included in this repository.

---

## Model Details

* Backbone: MobileNetV2 (ImageNet pretrained)
* Input size: 224 × 224
* Output: 4-class classification (Grade 1–4)
* Head:

  * Global average pooling
  * Dense layers (256 → 128)
  * Dropout (0.3)
  * Softmax output

### Training Setup

* Loss function: Weighted CrossEntropyLoss (to address class imbalance)
* Optimizer: Adam (learning rate = 1e-4)
* Augmentations:

  * Random rotation
  * Horizontal flip
  * Brightness adjustments
* Class imbalance handled using weighted sampling (and SMOTE where applicable)

### Evaluation

The model is evaluated using:

* Accuracy
* F1-score
* Confusion matrix

Training artifacts such as loss curves and evaluation metrics are saved during training.

---

## Inference Pipeline

The inference flow is as follows:

1. Input image is received (base64 or upload)
2. Image is resized and normalized using ImageNet statistics
3. Model predicts class probabilities
4. Grad-CAM is applied to generate a heatmap
5. Risk scores and zones are derived
6. JSON response is returned to the frontend

---

## API Endpoints

### POST `/api/scan`

Processes a foot image and returns prediction results.

**Response:**

* overall risk score
* grade classification
* zone-wise scores
* heatmap (base64 or URL)
* recommendations
* trend indicator

### POST `/api/checkin`

Stores daily user vitals (blood sugar, steps, sleep, symptoms)

### POST `/api/chat`

Returns contextual responses based on recent scans and vitals

### GET `/api/history`

Returns recent scan history

### GET `/api/summary`

Returns aggregated patient data and trends

---

## Frontend

The frontend is built using React and TailwindCSS with a mobile-first layout.

Main views include:

* Dashboard (risk summary and trends)
* Scan (image capture and analysis)
* History (trend visualization)
* Check-in (daily health inputs)
* Care (caregiver and alert system)

The UI is intentionally minimal to focus on clarity and usability rather than visual complexity.

---

## Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend is configured to proxy API requests to the Flask backend.

---

## Training the Model

Model training was conducted in a notebook environment using a GPU-enabled setup.

To retrain:

```bash
cd backend/ml
python train.py
```

Ensure the dataset is structured as:

```
dataset/
  train/
    grade1/
    grade2/
    grade3/
    grade4/
  valid/
    grade1/
    grade2/
    grade3/
    grade4/
```

---

## Limitations

* The model is trained on a limited dataset and may not generalize across all skin tones, lighting conditions, or foot deformities.
* Predictions are not clinically validated and should not be used for diagnosis.
* Camera-based inference is an approximation and does not replace pressure-sensing hardware.

---

## Future Work

* Clinical validation with real-world patient data
* Improved dataset diversity and size
* Better calibration of risk scores
* On-device inference optimization (TensorFlow.js)
* Integration with healthcare providers

---
## Architecture Diagram
![Architecture Diagram](assets/architecture.png)

---
## Notes

Sole is intended as an early warning and monitoring tool. It is not a diagnostic system. Users are encouraged to consult medical professionals if high-risk indicators are observed.

