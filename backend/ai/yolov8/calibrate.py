#!/usr/bin/env python3
"""
Calibration tool to capture normalized polygon coordinates for seat zones.
Usage (Windows PowerShell):
  # In backend/ai/yolov8
  python calibrate.py --source ..\\video_demo.mp4 --out seat_zones_floor1.json --seat FD-1

How to use:
- Left click to add polygon vertices (3 or more).
- Press 'u' to undo last point.
- Press 'r' to reset current polygon.
- Press 's' to save current polygon (appends to JSON), then exits.
- Press 'q' to quit without saving.

The JSON will contain objects: { "seatCode": "FD-1", "polygon": [[x,y], ...] } with x,y in [0,1].
"""
import argparse
import json
import os
import cv2

def normalize_points(points, W, H):
    return [[float(x)/max(W,1), float(y)/max(H,1)] for (x,y) in points]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default='0')
    parser.add_argument('--out', default='seat_zones_floor1.json')
    parser.add_argument('--seat', required=True, help='Seat code, e.g., FD-1')
    args = parser.parse_args()

    source = args.source
    # Try to resolve to absolute path for files
    cap = None
    if source.isdigit():
        cap = cv2.VideoCapture(int(source))
    else:
        abs_path = os.path.abspath(source)
        if not os.path.exists(abs_path):
            print(f"[Hint] Source not found: {abs_path}. Try a full path like D:\\code_khoa\\backend\\video_demo.mp4 or use forward slashes.")
        cap = cv2.VideoCapture(abs_path)
    if not cap.isOpened():
        raise SystemExit(f"Cannot open source: {source}")

    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise SystemExit('Cannot read a frame from source')

    H, W = frame.shape[:2]
    pts = []
    win = 'Seat Calibrate (left-click to add point, u=undo, r=reset, s=save, q=quit)'

    def on_mouse(event, x, y, flags, param):
        nonlocal pts
        if event == cv2.EVENT_LBUTTONDOWN:
            pts.append((x, y))

    cv2.namedWindow(win)
    cv2.setMouseCallback(win, on_mouse)

    while True:
        vis = frame.copy()
        # draw existing polygon
        for i, (x, y) in enumerate(pts):
            cv2.circle(vis, (x, y), 4, (0, 255, 0), -1)
            if i > 0:
                cv2.line(vis, pts[i-1], (x, y), (0, 255, 0), 2)
        if len(pts) >= 3:
            cv2.line(vis, pts[-1], pts[0], (0, 255, 0), 2)
        cv2.putText(vis, f"Seat: {args.seat}", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (50, 200, 50), 2)
        cv2.putText(vis, "u=undo r=reset s=save q=quit", (10, H-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        cv2.imshow(win, vis)
        key = cv2.waitKey(30) & 0xFF
        if key == ord('u') and pts:
            pts.pop()
        elif key == ord('r'):
            pts = []
        elif key == ord('s'):
            if len(pts) < 3:
                print('Need at least 3 points to save a polygon')
                continue
            norm = normalize_points(pts, W, H)
            data = []
            if os.path.exists(args.out):
                try:
                    with open(args.out, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                except Exception:
                    data = []
            data = [d for d in data if (d.get('seatCode') != args.seat)]
            data.append({ 'seatCode': args.seat, 'polygon': norm })
            with open(args.out, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f'Saved seat {args.seat} to {args.out}')
            break
        elif key == ord('q'):
            break

    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
