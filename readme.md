chạy be 
cd /d D:\code_khoa\backend
npm run dev 

docker compose up -d swspace-mongodb

chạy fe 
cd /d D:\code_khoa\frontend
npm run dev

chạy yolov8
cd D:\code_khoa\backend\ai\yolov8
.\.venv\Scripts\Activate.ps1
python sender.py --backend http://localhost:5000 --source 0


LỆNH CHẠY BẢN VẼ VIDEO:
cd d:\code_khoa\backend\ai\yolov8
python -m pip install --upgrade pip
# Cài gói (nếu chưa có)
.\.venv\Scripts\Activate.ps1
pip install ultralytics opencv-python requests
# Chạy calibrate bằng đường dẫn tuyệt đối để tránh lỗi path
python calibrate.py --source D:\code_khoa\backend\video_demo.mp4 --out seat_zones_floor1.json --seat FD-2

Các bước nhanh – gạch đầu dòng
Sửa đúng file: .env (KHÔNG phải backend_user, KHÔNG phải frontend_user).
Tắt hết tiến trình node:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
cd d:\code_khoa\backend; npm run start
Mở:
http://localhost:5000/health (Postgres)
http://localhost:5000/api/integration/health (Mongo + mirror)