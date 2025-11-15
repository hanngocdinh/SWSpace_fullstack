#!/usr/bin/env python3
"""
YOLOv8 people counter sender for SWSpace
- Captures from webcam (default) or a video file/RTSP
- Counts 'person' detections per frame
- Sends peopleCount to backend /api/space/floor1/ai/status ~ every 1 second

Usage examples:
  python sender.py                # webcam 0, backend http://localhost:5000
  python sender.py --source 0     # explicit webcam 0
  python sender.py --source path/to/video.mp4
  python sender.py --backend http://localhost:5000 --model yolov8n.pt
  python sender.py --mock         # no camera, send random counts for testing

Requires: ultralytics, opencv-python, requests
"""
import argparse
import os
import random
import time
from datetime import datetime, timezone
import json

import requests

try:
    from ultralytics import YOLO
    import cv2
except Exception:
    YOLO = None
    cv2 = None


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def post_count(backend: str, namespace: str, count: int, floor: str = 'floor1'):
    try:
        # floor: floor1 | floor2 | floor3
        url = backend.rstrip('/') + f'/api/space/{floor}/{namespace}/status'
        r = requests.post(url, json={
            'peopleCount': int(count),
            'detectedAt': iso_now()
        }, timeout=3)
        r.raise_for_status()
    except Exception:
        # keep silent to avoid noisy console
        pass


def post_seat_event(backend: str, namespace: str, seat_code: str, occupied: bool, floor: str = 'floor1'):
    try:
        url = backend.rstrip('/') + f'/api/space/{floor}/{namespace}/seat'
        r = requests.post(url, json={
            'seatCode': seat_code,
            'occupied': bool(occupied),
            'detectedAt': iso_now()
        }, timeout=3)
        r.raise_for_status()
    except Exception:
        # silent fail
        pass


def run_mock(backend: str, namespace: str, floor: str = 'floor1'):
    print(f"[MOCK] Sending random people counts to {backend} (Ctrl+C to stop)")
    last_sent = 0
    while True:
        now = time.time()
        if now - last_sent >= 1.0:
            c = random.choice([0, 0, 0, 1, 2, 3])
            post_count(backend, namespace, c, floor)
            last_sent = now
        time.sleep(0.05)


def _point_in_polygon(x: float, y: float, polygon: list[tuple[float, float]]):
    # Ray casting algorithm
    inside = False
    n = len(polygon)
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        if ((y1 > y) != (y2 > y)):
            xinters = (x2 - x1) * (y - y1) / (y2 - y1 + 1e-9) + x1
            if x < xinters:
                inside = not inside
    return inside


def run_yolo(
    backend: str,
    namespace: str,
    floor: str,
    source: str | int,
    model_path: str,
    seat_zones_path: str | None = None,
    conf: float = 0.45,
    classes: list[int] | None = None,
    min_area_ratio: float = 0.002,
    face_verify: bool = False,
    aspect_ratio_thresh: float = 1.0,
):
    if YOLO is None or cv2 is None:
        raise RuntimeError("ultralytics and opencv-python are required. Install dependencies first.")

    model = YOLO(model_path)
    # Optional face detector (for HD namespace to avoid false positives)
    face_cascade = None
    if face_verify and cv2 is not None:
        try:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        except Exception:
            face_cascade = None
    # Load seat zones (normalized polygons)
    seat_zones = []
    if seat_zones_path and os.path.exists(seat_zones_path):
        try:
            with open(seat_zones_path, 'r', encoding='utf-8') as f:
                raw = json.load(f)
                for z in raw:
                    seat = str(z.get('seatCode') or '').strip()
                    poly = z.get('polygon') or []
                    if seat and isinstance(poly, list) and len(poly) >= 3:
                        seat_zones.append({
                            'seatCode': seat,
                            'polygon': [(float(px), float(py)) for px, py in poly]
                        })
        except Exception:
            seat_zones = []
    # Try to open video source
    if isinstance(source, str) and source != '0':
        cap = cv2.VideoCapture(source)
    else:
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        raise RuntimeError(f"Cannot open source: {source}")

    print(f"[YOLOv8] Running people/seat detection from source={source}, sending to {backend} (Ctrl+C to stop)")
    last_sent = 0.0
    last_seat_state: dict[str, bool] = {}
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            # Inference
            results = model.predict(source=frame, conf=conf, classes=classes, verbose=False)
            count = 0
            H, W = frame.shape[:2]
            detections = []  # normalized centers
            gray = None
            if face_cascade is not None:
                try:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                except Exception:
                    gray = None
            for r in results:
                boxes = r.boxes
                if boxes is None:
                    continue
                cls_list = boxes.cls.tolist() if boxes.cls is not None else []
                xyxy = boxes.xyxy.tolist() if boxes.xyxy is not None else []
                for cls_id, (x1, y1, x2, y2) in zip(cls_list, xyxy):
                    # Only accept configured classes (default: person=0)
                    if classes is not None and int(cls_id) not in classes:
                        continue
                    # Filter tiny boxes (noise/flicker)
                    w = max(0.0, (x2 - x1))
                    h = max(0.0, (y2 - y1))
                    area = w * h
                    if (area / max(W * H, 1)) < max(min_area_ratio, 1e-6):
                        continue
                    # Optional human-shape verification: require tall-ish box OR a face inside
                    ratio = h / max(w, 1.0)
                    verified = True
                    if face_verify:
                        verified = False
                        # Condition A: tall human-like bbox
                        if ratio >= max(0.1, aspect_ratio_thresh):
                            verified = True
                        # Condition B: face present within bbox (upper half preferred)
                        if not verified and gray is not None and face_cascade is not None:
                            x1i, y1i, x2i, y2i = int(max(0, x1)), int(max(0, y1)), int(min(W-1, x2)), int(min(H-1, y2))
                            roi = gray[y1i:y2i, x1i:x2i].copy() if y2i>y1i and x2i>x1i else None
                            if roi is not None and roi.size:
                                faces = face_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=3, minSize=(24, 24))
                                if len(faces) > 0:
                                    verified = True
                    if not verified:
                        continue
                    count += 1
                    cx = (x1 + x2) / 2.0
                    cy = (y1 + y2) / 2.0
                    detections.append((cx / max(W, 1), cy / max(H, 1)))

            # Estimate seat occupancy if zones provided
            if seat_zones:
                current_state = { z['seatCode']: False for z in seat_zones }
                for (nx, ny) in detections:
                    for z in seat_zones:
                        if _point_in_polygon(nx, ny, z['polygon']):
                            current_state[z['seatCode']] = True
                # Compare and emit changes
                for seat, occ in current_state.items():
                    prev = last_seat_state.get(seat)
                    if prev is None:
                        last_seat_state[seat] = occ
                    elif prev != occ:
                        last_seat_state[seat] = occ
                        post_seat_event(backend, namespace, seat, occ, floor)
            # Throttle ~1 Hz
            now = time.time()
            if now - last_sent >= 1.0:
                post_count(backend, namespace, count, floor)
                last_sent = now
            # tiny sleep to keep CPU reasonable
            time.sleep(0.01)
    finally:
        cap.release()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--backend', default=os.environ.get('SWS_BACKEND', 'http://localhost:5000'))
    parser.add_argument('--source', default='0', help='0 for webcam, or path/URL to video/rtsp')
    parser.add_argument('--namespace', default='ai', help='Endpoint namespace: ai (fixed), ai-hd (hot desk), etc.')
    parser.add_argument('--floor', default=os.environ.get('SWS_FLOOR', 'floor1'), help='Target floor path: floor1, floor2, floor3')
    parser.add_argument('--model', default='yolov8n.pt')
    parser.add_argument('--seat-zones', default=None, help='Path to seat zones JSON (normalized polygons)')
    parser.add_argument('--conf', type=float, default=0.45, help='Confidence threshold (0..1)')
    parser.add_argument('--classes', default='0', help='Comma-separated class ids to keep (default: 0=person)')
    parser.add_argument('--min-area', type=float, default=0.002, help='Min bbox area ratio to accept (default 0.2%)')
    parser.add_argument('--face-verify', type=int, default=0, help='Require human-shape/face heuristics (1=yes)')
    parser.add_argument('--ar-thresh', type=float, default=1.0, help='Aspect ratio (h/w) threshold for human-like boxes')
    parser.add_argument('--mock', action='store_true', help='Send random counts without camera/YOLO')
    args = parser.parse_args()

    if args.mock:
        run_mock(args.backend, args.namespace, args.floor)
    else:
        classes = [int(x.strip()) for x in str(args.classes).split(',') if x.strip().isdigit()]
        if not classes:
            classes = [0]
        run_yolo(
            args.backend,
            args.namespace,
            args.floor,
            args.source,
            args.model,
            args.seat_zones,
            conf=float(args.conf),
            classes=classes,
            min_area_ratio=float(args.min_area),
            face_verify=bool(int(args.face_verify)),
            aspect_ratio_thresh=float(args.ar_thresh),
        )
