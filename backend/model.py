"""
Sole — ML Model Inference (Mock Mode)
Uses fallback inference since PyTorch is not required.
Deploy with sole_best.pth for real model inference.
"""

import os
import base64
import io
import json
import random
from PIL import Image

# ─── Configuration ─────────────────────────────────────────────────────────────
MODEL_PATH = os.environ.get('MODEL_PATH', 'sole_best.pth')
IMG_SIZE = 224

CLASS_NAMES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']
GRADE_LABELS = [
    'Superficial ulcer risk',
    'Deep ulcer risk',
    'Deep ulcer with abscess',
    'Gangrene — critical',
]

# Recommendations by grade and zone
RECOMMENDATIONS_BANK = {
    'heel': [
        ('Reduce standing time', 'Your heel is under sustained pressure. Aim for a 10-minute break every 30 minutes.'),
        ('Cushion your heel', 'Use gel heel inserts or thick-soled footwear today to redistribute pressure.'),
        ('Moisturise tonight', 'Apply urea-based cream to your heel before bed to prevent crack formation.'),
    ],
    'ball': [
        ('Avoid hard surfaces', 'The ball of your foot is stressed. Wear cushioned footwear and avoid walking barefoot.'),
        ('Foot elevation', 'Elevate your feet for 15 minutes after walking to reduce pressure buildup.'),
        ('Check your shoes', 'Ensure your shoes aren\'t too tight at the front — this directly affects ball-of-foot pressure.'),
    ],
    'arch': [
        ('Arch support recommended', 'Your arch zone shows early stress. Orthotics or arch-support insoles can significantly help.'),
        ('Gentle stretches', 'Roll a tennis ball under your foot for 2 minutes to relieve arch tension.'),
        ('Reduce flat footwear', 'Avoid completely flat shoes today — a small heel lift reduces arch strain.'),
    ],
    'toe': [
        ('Check for redness', 'Your toe zone is elevated. Inspect your toes today for any redness or blistering.'),
        ('Trim nails carefully', 'Ensure toenails are trimmed straight across to avoid pressure points.'),
        ('Roomy footwear', 'Switch to shoes with a wide toe box to prevent compression on toe zones.'),
    ],
    'general': [
        ('Book a check-up', 'Your overall risk is elevated. Consider scheduling a visit with your podiatrist this week.'),
        ('Stay off your feet', 'Limit standing and walking today. Rest is the most effective pressure relief.'),
        ('Log your blood sugar', 'High blood sugar directly affects nerve sensitivity. Ensure you\'ve logged today\'s reading.'),
    ],
}


# ─── Mock Model (no PyTorch required) ──────────────────────────────────────────
def get_model():
    """Mock model loader for demo mode."""
    print('✓ Model ready (running in demo mode)')
    return None


# ─── Inference ────────────────────────────────────────────────────────────────
def infer_image(image_b64: str) -> dict:
    """
    Run mock inference on a base64-encoded image.
    (Replace with real PyTorch model if sole_best.pth is available)
    
    Returns:
        dict with: grade, grade_label, confidence, overall_risk, zones, probabilities
    """
    try:
        # Decode image (validates format)
        raw = image_b64.split(',')[1] if ',' in image_b64 else image_b64
        img_bytes = base64.b64decode(raw)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    except Exception as e:
        print(f'Error decoding image: {e}')
        return fallback_infer()
    
    # Use fallback inference (demo mode)
    return fallback_infer()


def fallback_infer() -> dict:
    """Fallback inference when model fails."""
    import random
    overall = random.randint(30, 75)
    heel = overall + random.randint(-10, 15)
    ball = overall - random.randint(5, 20)
    arch = overall - random.randint(20, 35)
    toe = overall - random.randint(10, 25)
    
    grade = 1 if overall < 40 else 2 if overall < 60 else 3 if overall < 80 else 4
    
    worst = max(
        {'heel': heel, 'ball': ball, 'arch': arch, 'toe': toe},
        key=lambda z: {'heel': heel, 'ball': ball, 'arch': arch, 'toe': toe}[z]
    )
    recs_pool = list(RECOMMENDATIONS_BANK[worst]) + list(RECOMMENDATIONS_BANK['general'])
    selected_recs = random.sample(recs_pool, min(3, len(recs_pool)))
    
    return {
        'grade': grade,
        'grade_label': GRADE_LABELS[grade - 1],
        'confidence': round(random.uniform(75, 95), 1),
        'overall_risk': overall,
        'zones': {
            'heel': min(100, heel),
            'ball': min(100, ball),
            'arch': min(100, arch),
            'toe': min(100, toe),
        },
        'probabilities': {
            'Grade 1': round(random.uniform(5, 30), 1),
            'Grade 2': round(random.uniform(30, 70), 1),
            'Grade 3': round(random.uniform(5, 25), 1),
            'Grade 4': round(random.uniform(1, 15), 1),
        },
        'recommendations': [{'action': r[0], 'detail': r[1]} for r in selected_recs],
    }


# ─── Grad-CAM Heatmap ────────────────────────────────────────────────────────
def generate_heatmap(image: Image.Image, zones: dict) -> str:
    """
    Generate simplified heatmap overlay using PIL only (no numpy/cv2).
    Returns base64-encoded JPEG.
    """
    try:
        # Resize image to standard size
        img_resized = image.resize((300, 450), Image.LANCZOS)
    except Exception:
        img_resized = Image.new('RGB', (300, 450), (245, 245, 245))
    
    # Create overlay
    overlay = Image.new('RGBA', img_resized.size, (0, 0, 0, 0))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(overlay)
    
    def risk_to_color(score: int) -> tuple:
        """Map risk score to RGBA heatmap color."""
        if score < 40:
            return (16, 185, 129, 100)  # Green
        elif score < 70:
            return (11, 158, 245, 120)  # Amber
        else:
            return (68, 68, 239, 140)  # Red
    
    # Zone regions
    zone_regions = {
        'toe': (40, 10, 260, 90),
        'ball': (30, 90, 270, 180),
        'arch': (50, 180, 250, 290),
        'heel': (40, 290, 260, 430),
    }
    
    # Draw colored ellipses for each zone
    for zone_name, (x1, y1, x2, y2) in zone_regions.items():
        zone_score = zones.get(zone_name, 50)
        color = risk_to_color(zone_score)
        draw.ellipse([x1, y1, x2, y2], fill=color, outline=color)
    
    # Composite overlay onto original
    img_resized = img_resized.convert('RGBA')
    blended = Image.alpha_composite(img_resized, overlay).convert('RGB')
    
    # Encode to base64 JPEG
    buf = io.BytesIO()
    blended.save(buf, format='JPEG', quality=88)
    heatmap_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return heatmap_b64


# ─── Baseline Calculation ─────────────────────────────────────────────────────
def calculate_baseline(scans: list) -> dict:
    """
    Calculate average zone scores from first 3 scans.
    """
    if len(scans) == 0:
        return {'heel': 0, 'ball': 0, 'arch': 0, 'toe': 0}
    
    n = min(3, len(scans))
    return {
        'heel': sum(s.heel for s in scans[:n]) / n,
        'ball': sum(s.ball for s in scans[:n]) / n,
        'arch': sum(s.arch for s in scans[:n]) / n,
        'toe': sum(s.toe for s in scans[:n]) / n,
    }


def calculate_baseline_diff(current_zones: dict, baseline: dict) -> dict:
    """
    Calculate percentage difference from baseline.
    """
    return {
        'heel': int((current_zones['heel'] - baseline['heel']) / max(baseline['heel'], 1) * 100),
        'ball': int((current_zones['ball'] - baseline['ball']) / max(baseline['ball'], 1) * 100),
        'arch': int((current_zones['arch'] - baseline['arch']) / max(baseline['arch'], 1) * 100),
        'toe': int((current_zones['toe'] - baseline['toe']) / max(baseline['toe'], 1) * 100),
    }


# ─── Trend Analysis ────────────────────────────────────────────────────────────
def calculate_trend(current_risk: int, previous_scans: list) -> tuple:
    """
    Calculate trend vs previous scan.
    Returns: (trend_direction, trend_percentage)
    """
    if not previous_scans or len(previous_scans) == 0:
        return ('new', 0.0)
    
    last_risk = previous_scans[0].overall_risk
    diff = current_risk - last_risk
    
    if abs(diff) <= 3:
        trend = 'stable'
    elif diff > 3:
        trend = 'increasing'
    else:
        trend = 'decreasing'
    
    pct = abs(diff) / max(last_risk, 1) * 100
    
    return (trend, round(pct, 1))
