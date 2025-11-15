# YOLOv8 People & Seat Occupancy for Floor 1

This folder provides a ready-to-run script to send real-time `peopleCount` and per-seat occupancy changes to the backend, powering the Admin → Space Management → Floor 1 → AI Occupancy Detection.

## How the Admin UI behaves
- One toggle button controls the camera:
  - Active: UI opens a real-time stream and shows activities.
  - Pause: UI stops listening, clears all activities, shows “Camera paused”, and resets counters to 0.
- The sender can keep posting while paused; the UI simply ignores updates until reactivated.

## Prerequisites
- Windows with Python 3.9–3.11
- Backend running on http://localhost:5000

## Setup (Windows PowerShell)
```powershell
# In this folder: backend/ai/yolov8
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install ultralytics opencv-python requests
```

## Run the sender
We included `sender.py` for convenience.

```powershell
# Webcam (device 0)
python sender.py --backend http://localhost:5000 --source 0

# From a video file
python sender.py --backend http://localhost:5000 --source d:\videos\floor1.mp4

# Mock mode (no camera/model): send random counts
python sender.py --backend http://localhost:5000 --mock
```

Options:
- `--backend`: Backend base URL (default http://localhost:5000). Or set env `SWS_BACKEND`.
- `--source`: `0` for default webcam, or path/URL (e.g., file path, RTSP URL).
- `--model`: YOLO model (default `yolov8n.pt`).
- `--mock`: Run without camera or YOLO; sends random counts at ~1 Hz.
 - `--seat-zones`: Path to a JSON file describing seat polygons (normalized 0..1) for per-seat occupancy.
 - `--namespace`: Endpoint namespace to target: `ai` (Fixed Desk), `ai-hd` (Hot Desk), etc.

Example seat zones file `seat_zones_floor1.json` (normalized coordinates):

```json
[
  {
    "seatCode": "FD-1",
    "polygon": [[0.10, 0.20], [0.20, 0.20], [0.20, 0.35], [0.10, 0.35]]
  },
  {
    "seatCode": "FD-2",
    "polygon": [[0.25, 0.20], [0.35, 0.20], [0.35, 0.35], [0.25, 0.35]]
  }
]
```

Notes:
- Points are normalized to the video frame: `[0,0]` is top-left, `[1,1]` is bottom-right.
- The script maps each detected person’s bounding-box center to the polygon; when a seat’s occupancy flips, an event is sent.

## Endpoints used
The script posts JSON to:

```
POST /api/space/floor1/{namespace}/status
{
  "peopleCount": <int>,
  "detectedAt": "<ISO 8601 UTC>"
}
```

And per-seat events to:

```
POST /api/space/floor1/{namespace}/seat
{
  "seatCode": "FD-1",
  "occupied": true,
  "detectedAt": "<ISO 8601 UTC>"
}
```

The backend broadcasts these via SSE. The Admin UI listens only when the camera is Active.

## Notes
- You can still call `/api/space/floor1/ai/control` to switch between Active and Pause.
- For more floors, parameterize floor code and duplicate the endpoints.
- If webcam can’t open, try a different index or pass a video file/RTSP URL to `--source`.
- When the Admin UI toggles Active, the backend auto-starts/stops this worker and will pass `--seat-zones seat_zones_floor1.json` if present, and prefer `video_demo.mp4` if available as source.

## Calibrate seat polygons (easy mode)
Use the helper to pick polygon points directly on the video frame and save normalized coordinates:

```powershell
# In backend/ai/yolov8
python calibrate.py --source ..\video_demo.mp4 --out seat_zones_floor1.json --seat FD-1
# Click 3+ points around the seat area; press 's' to save. Repeat per seat.
```
