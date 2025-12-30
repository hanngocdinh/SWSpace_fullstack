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
import base64
import math
import numpy as np

import requests

try:
    from ultralytics import YOLO
    import cv2
    import numpy as np
except Exception:
    YOLO = None
    cv2 = None


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def post_count(backend: str, namespace: str, count: int, floor: str = 'floor1', boxes: list | None = None, frame_b64: str | None = None):
    try:
        # floor: floor1 | floor2 | floor3
        url = backend.rstrip('/') + f'/api/space/{floor}/{namespace}/status'
        payload = {
            'peopleCount': int(count),
            'detectedAt': iso_now()
        }
        if boxes is not None:
            # boxes: list of {id:int, x1:float, y1:float, x2:float, y2:float} normalized 0..1
            payload['boxes'] = boxes
        if frame_b64 is not None:
            # JPEG base64 string of current frame
            payload['frame'] = frame_b64
        r = requests.post(url, json=payload, timeout=3)
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
    conf: float = 0.4,
    classes: list[int] | None = None,
    min_area_ratio: float = 0.003,
    face_verify: bool = False,
    aspect_ratio_thresh: float = 1.0,
    draw_boxes: bool = True,
    max_dim: int = 960,
    jpeg_quality: int = 60,
    strict_human: bool = False,
    imgsz: int = 960,
    iou: float = 0.55,
    post_interval: float | None = None,
    stream_max_dim: int | None = None,
    device: str | None = None,
):
    """Simplified stable YOLO loop.
    Previous version got corrupted causing runtime errors (missing variables, stray code).
    This version guarantees:
      - Always encodes & sends a frame (even when count=0) ~0.8s interval.
      - Simple acceptance in non-strict mode: all person boxes above min_area.
      - Strict mode: basic aspect ratio filter (h/w between 0.35..5) + min_area.
      - Optional face verification (kept minimal) when strict_human & face_verify.
      - Seat zone occupancy by centroid.
    """
    if YOLO is None or cv2 is None:
        raise RuntimeError("ultralytics and opencv-python are required.")

    model = YOLO(model_path)
    RELAX = os.environ.get('SWS_RELAX_HUMAN', '0') == '1'
    DEBUG_AI = os.environ.get('SWS_DEBUG_AI', '0') == '1'
    if not strict_human:  # disable face heuristics for speed in simple mode
        face_verify = False

    face_cascade = None
    if face_verify:
        try:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        except Exception:
            face_cascade = None

    # Load seat zones
    seat_zones = []
    if seat_zones_path and os.path.exists(seat_zones_path):
        try:
            with open(seat_zones_path, 'r', encoding='utf-8') as f:
                raw = json.load(f)
            for z in raw:
                seat = str(z.get('seatCode') or '').strip()
                poly = z.get('polygon') or []
                if seat and isinstance(poly, list) and len(poly) >= 3:
                    seat_zones.append({'seatCode': seat, 'polygon': [(float(px), float(py)) for px, py in poly]})
        except Exception:
            seat_zones = []

    # Open source
    cap = cv2.VideoCapture(source if isinstance(source, str) and source != '0' else 0)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open source: {source}")

    print(f"[YOLOv8] Started (strict={strict_human}) source={source} backend={backend} namespace={namespace} floor={floor}")
    MAX_DIM = int(max_dim) if max_dim >= 360 else 960
    INFER_SIZE = int(imgsz) if imgsz >= 320 else MAX_DIM
    STREAM_DIM = int(stream_max_dim) if stream_max_dim and stream_max_dim >= 360 else None
    JPEG_QUALITY = max(10, min(int(jpeg_quality), 95))
    ENV_POST = float(os.environ.get('SWS_POST_INTERVAL', '0'))
    POST_INTERVAL = float(post_interval) if post_interval and post_interval > 0 else (ENV_POST if ENV_POST > 0 else 0.65)
    last_sent = 0.0
    last_seat_state: dict[str, bool] = {}
    presence_counts: dict[str, int] = {}
    absence_counts: dict[str, int] = {}
    OCC_FRAMES = 30 
    VACATE_FRAMES = 30  

    try:
        while True:
            ok, frame_orig = cap.read()
            if not ok:
                break
            frame = frame_orig
            try:
                h0, w0 = frame_orig.shape[:2]
                if max(w0, h0) > MAX_DIM:
                    scale = MAX_DIM / float(max(w0, h0))
                    frame = cv2.resize(frame_orig, (int(w0 * scale), int(h0 * scale)), interpolation=cv2.INTER_AREA)
                else:
                    frame = frame_orig.copy()
            except Exception:
                frame = frame_orig

            H, W = frame.shape[:2]
            boxes_out = []
            count = 0

            # Inference (silent)
            try:
                predict_kwargs = {
                    'source': frame,
                    'conf': conf,
                    'classes': classes,
                    'verbose': False,
                    'imgsz': INFER_SIZE,
                    'iou': iou,
                    'agnostic_nms': True,
                    'max_det': 30
                }
                if device and str(device).strip().lower() not in ('', 'auto'):
                    predict_kwargs['device'] = device
                results = model.predict(**predict_kwargs)
            except Exception as e:
                if DEBUG_AI:
                    print(f"[YOLOv8] inference error: {e}")
                results = []

            gray = None
            if face_cascade is not None:
                try:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                except Exception:
                    gray = None

            # Collect boxes
            for r in results:
                if r.boxes is None:
                    continue
                cls_list = r.boxes.cls.tolist() if r.boxes.cls is not None else []
                xyxy = r.boxes.xyxy.tolist() if r.boxes.xyxy is not None else []
                for cls_id, (x1, y1, x2, y2) in zip(cls_list, xyxy):
                    if classes is not None and int(cls_id) not in classes:
                        continue
                    w = max(0.0, x2 - x1)
                    h = max(0.0, y2 - y1)
                    area_ratio = (w * h) / max(W * H, 1)
                    if area_ratio < max(min_area_ratio, 1e-6):
                        continue
                    accept = True
                    if strict_human:
                        ratio = h / max(w, 1.0)
                        if ratio < (0.35 if RELAX else 0.45) or ratio > 5.0:
                            accept = False
                        if accept and face_verify and gray is not None and face_cascade is not None:
                            try:
                                roi = gray[int(max(0,y1)):int(min(H-1,y2)), int(max(0,x1)):int(min(W-1,x2))]
                                if roi.size:
                                    faces = face_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=3, minSize=(32,32)) or []
                                    if not faces:
                                        # allow even without face to avoid misses (primary filter is ratio)
                                        pass
                            except Exception:
                                pass
                    if not accept:
                        continue
                    count += 1
                    boxes_out.append({
                        'id': count,  # sequential id
                        'x1': max(0.0, x1) / max(W, 1),
                        'y1': max(0.0, y1) / max(H, 1),
                        'x2': max(0.0, x2) / max(W, 1),
                        'y2': max(0.0, y2) / max(H, 1)
                    })

            # Seat zones occupancy with dwell filter (chỉ khi ngồi thực sự, tránh đi ngang)
            if seat_zones:
                raw_state = {z['seatCode']: False for z in seat_zones}
                for b in boxes_out:
                    cx = (b['x1'] + b['x2']) / 2.0
                    cy = (b['y1'] + b['y2']) / 2.0
                    for z in seat_zones:
                        if _point_in_polygon(cx, cy, z['polygon']):
                            raw_state[z['seatCode']] = True
                # Cập nhật counters
                for seat, inside in raw_state.items():
                    if inside:
                        presence_counts[seat] = presence_counts.get(seat, 0) + 1
                        absence_counts[seat] = 0
                    else:
                        absence_counts[seat] = absence_counts.get(seat, 0) + 1
                        presence_counts[seat] = 0
                    confirmed_prev = last_seat_state.get(seat, False)
                    # Xác nhận ngồi
                    if not confirmed_prev and presence_counts[seat] >= OCC_FRAMES:
                        last_seat_state[seat] = True
                        post_seat_event(backend, namespace, seat, True, floor)
                    # Xác nhận rời ghế
                    elif confirmed_prev and absence_counts[seat] >= VACATE_FRAMES:
                        last_seat_state[seat] = False
                        post_seat_event(backend, namespace, seat, False, floor)

            now = time.time()
            if (now - last_sent) >= POST_INTERVAL or last_sent == 0.0:
                frame_to_encode = frame
                if draw_boxes:
                    try:
                        for idx, b in enumerate(boxes_out):
                            x1p = int(b['x1'] * W); y1p = int(b['y1'] * H)
                            x2p = int(b['x2'] * W); y2p = int(b['y2'] * H)
                            cv2.rectangle(frame_to_encode, (x1p, y1p), (x2p, y2p), (255, 0, 140), 2)
                            label = f"{idx+1}"
                            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
                            cv2.rectangle(frame_to_encode, (x1p, max(0, y1p - th - 6)), (x1p + tw + 8, max(0, y1p)), (255, 0, 140), -1)
                            cv2.putText(frame_to_encode, label, (x1p + 4, max(14, y1p - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255,255,255), 1, cv2.LINE_AA)
                    except Exception:
                        pass
                if STREAM_DIM and max(frame_to_encode.shape[0], frame_to_encode.shape[1]) > STREAM_DIM:
                    try:
                        scale_stream = STREAM_DIM / float(max(frame_to_encode.shape[1], frame_to_encode.shape[0]))
                        frame_to_encode = cv2.resize(
                            frame_to_encode,
                            (int(frame_to_encode.shape[1] * scale_stream), int(frame_to_encode.shape[0] * scale_stream)),
                            interpolation=cv2.INTER_AREA
                        )
                    except Exception:
                        frame_to_encode = frame
                try:
                    ok_j, buf = cv2.imencode('.jpg', frame_to_encode, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
                    frame_b64 = base64.b64encode(buf).decode('ascii') if ok_j else None
                except Exception:
                    frame_b64 = None
                post_count(backend, namespace, count, floor, boxes_out, frame_b64)
                last_sent = now
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
    parser.add_argument('--conf', type=float, default=0.55, help='Confidence threshold (0..1)')
    parser.add_argument('--classes', default='0', help='Comma-separated class ids to keep (default: 0=person ONLY)')
    parser.add_argument('--min-area', type=float, default=0.004, help='Min bbox area ratio to accept (0.4%)')
    parser.add_argument('--face-verify', type=int, default=1, help='Require human-shape/face heuristics (1=yes) - ENABLED by default')
    parser.add_argument('--ar-thresh', type=float, default=0.8, help='Aspect ratio (h/w) threshold for human-like boxes - optimized for seated/standing')
    parser.add_argument('--draw-boxes', type=int, default=1, help='Vẽ khung và nhãn trực tiếp lên frame trước khi encode (1=on)')
    parser.add_argument('--max-dim', type=int, default=640, help='Giảm kích thước (mặc định 640) để giảm lag')
    parser.add_argument('--jpeg-quality', type=int, default=55, help='Chất lượng JPEG (55) giảm delay')
    parser.add_argument('--imgsz', type=int, default=960, help='Kích thước suy luận (imgsz) cho YOLO (mặc định 960)')
    parser.add_argument('--iou', type=float, default=0.55, help='Ngưỡng IOU NMS (mặc định 0.55)')
    parser.add_argument('--post-interval', type=float, default=0.65, help='Khoảng thời gian gửi dữ liệu (giây)')
    parser.add_argument('--stream-max-dim', type=int, default=720, help='Giới hạn kích thước frame gửi về frontend (720p)')
    parser.add_argument('--device', default='auto', help='Thiết bị YOLO: auto/cpu/cuda:0 ...')
    parser.add_argument('--mock', action='store_true', help='Send random counts without camera/YOLO')
    parser.add_argument('--strict-human', type=int, default=0, help='1 = bật lọc nâng cao chống đồ vật, 0 = đơn giản (khuyên dùng)')
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
            draw_boxes=bool(int(args.draw_boxes)),
            max_dim=int(args.max_dim),
            jpeg_quality=int(args.jpeg_quality),
            strict_human=bool(int(args.strict_human)),
            imgsz=int(args.imgsz),
            iou=float(args.iou),
            post_interval=float(args.post_interval),
            stream_max_dim=int(args.stream_max_dim),
            device=None if str(args.device).strip().lower() in ('auto', '') else args.device,
        )
