SWSpace – Hướng dẫn cài đặt & chạy hệ thống (Windows)

1) Mục tiêu
- Tài liệu này hướng dẫn giảng viên cài đặt và chạy toàn bộ hệ thống gồm:
  (1) Backend API (Node.js/Express) + PostgreSQL (Docker)
  (2) Frontend người dùng (React – Create React App)
  (3) Frontend quản trị (React + Vite)
  (4) Module AI (YOLOv8) gửi dữ liệu số người/ghế theo thời gian thực về Backend

2) Yêu cầu (Tools cần cài – KHÔNG nằm trong source code)
A. Tools chung
- Windows 10/11
- Git (khuyến nghị, nếu cần clone)
- Visual Studio Code (khuyến nghị để mở source)

B. Backend + Database
- Node.js >= 16 (khuyến nghị 18 LTS)
- npm (đi kèm Node.js)
- Docker Desktop (kèm Docker Compose)

C. Frontend
- Node.js + npm (dùng chung với Backend)

D. AI YOLOv8
- Python 3.10+ (khuyến nghị 3.10/3.11)
- pip
- (Khuyến nghị) dùng môi trường ảo Python (venv) – dự án đã có thư mục .venv trong backend/ai/yolov8

3) Cấu trúc thư mục chính
- backend/           : Backend API (Node.js/Express) + cấu hình PostgreSQL
- frontend_user/     : Giao diện người dùng (React CRA)
- frontend_admin/    : Giao diện quản trị (React + Vite)
- backend/ai/yolov8/ : Module AI YOLOv8 (Python) + sender/calibrate

4) Cài đặt & chạy nhanh (khuyến nghị theo thứ tự)

BƯỚC 0 – Giải nén source code
- Giải nén thư mục dự án (ví dụ: D:\code_khoa\code_khoa)
- Mở PowerShell (hoặc CMD) với quyền bình thường.

BƯỚC 1 – Chạy PostgreSQL bằng Docker
1.1 Mở Docker Desktop và đảm bảo Docker đang chạy.
1.2 Vào thư mục backend và chạy docker-compose:
  cd /d D:\code_khoa\backend
  docker-compose up -d

1.3 Kiểm tra container:
  docker-compose ps

Ghi chú:
- PostgreSQL container: swspace_postgres
- pgAdmin (tuỳ chọn): http://localhost:9090  (email: admin@swspace.vn / pass: admin123)
- DB mặc định (theo docker-compose.yml):
  DB_NAME=swspace
  DB_USER=swspace_user
  DB_PASSWORD=swspace_password
  DB_PORT=5432

BƯỚC 2 – Cấu hình .env cho Backend
2.1 Tại thư mục backend, copy file mẫu:
  cd /d D:\code_khoa\backend
  copy .env.example .env

2.2 Mở file backend\.env và chỉnh các biến quan trọng:
- PORT=5000
  (Lưu ý: code backend mặc định chạy 5000; nếu để 3000 sẽ dễ lệch với frontend)
- ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174
  (5174 là cổng mặc định của frontend_admin)

BƯỚC 3 – Chạy Backend (Node.js)
3.1 Cài dependencies:
  cd /d D:\code_khoa\backend
  npm install

3.2 Chạy backend (chế độ dev – tự reload):
  npm run dev

Hoặc chạy chế độ thường:
  npm run start

3.3 Kiểm tra backend:
- Health Postgres:
  http://localhost:5000/health
- Health tích hợp:
  http://localhost:5000/api/integration/health
  (hiện chỉ còn PostgreSQL; phần Mongo legacy đã gỡ)

BƯỚC 4 – Tạo tài khoản admin (để đăng nhập trang quản trị)
4.1 Mở terminal khác, chạy:
  cd /d D:\code_khoa\backend
  npm run seed:admin

4.2 Script sẽ hỏi email/password. Nếu bấm Enter bỏ trống sẽ dùng mặc định:
- Email: admin@example.com
- Password: password123

Ghi chú: có thể chạy không cần nhập (non-interactive):
  set ADMIN_EMAIL=admin@example.com
  set ADMIN_PASSWORD=password123
  node scripts\seedAdmin.js

BƯỚC 5 – Chạy Frontend người dùng (frontend_user)
5.1 Tạo file .env (nếu chưa có) tại frontend_user\ . Nội dung:
  REACT_APP_API_URL=http://localhost:5000

5.2 Cài và chạy:
  cd /d D:\code_khoa\frontend_user
  npm install
  npm start

5.3 Truy cập:
- Frontend User: http://localhost:3000

BƯỚC 6 – Chạy Frontend quản trị (frontend_admin)
6.1 (Tuỳ chọn) tạo file frontend_admin\.env để cấu hình URL backend:
- VITE_BACKEND_URL=http://localhost:5000
- VITE_API_URL=http://localhost:5000
- VITE_API_BASE_URL=http://localhost:5000
- VITE_USER_LOGIN_URL=http://localhost:3000/login

Ghi chú:
- Một số màn hình có hardcode http://localhost:5000 nên nếu chạy backend khác cổng thì cần chỉnh lại.
- frontend_admin chạy cổng 5174 theo cấu hình vite.config.ts.

6.2 Cài và chạy:
  cd /d D:\code_khoa\frontend_admin
  npm install
  npm run dev

6.3 Truy cập:
- Frontend Admin: http://localhost:5174
- Đăng nhập: dùng tài khoản admin ở BƯỚC 4.

5) Chạy AI YOLOv8 (Python) – gửi dữ liệu lên Backend
Mục đích:
- Module AI phát hiện người (person) từ webcam/video và gửi kết quả về Backend theo chu kỳ.
- Backend nhận dữ liệu tại các endpoint dạng:
  POST /api/space/floor1/ai/status
  POST /api/space/floor2/ai/status
  POST /api/space/floor3/ai/status

BƯỚC AI-1 – Kích hoạt môi trường Python và cài thư viện
1) Vào thư mục AI:
  cd /d D:\code_khoa\backend\ai\yolov8

2) (Khuyến nghị) nâng pip:
  python -m pip install --upgrade pip

3) Kích hoạt venv có sẵn (PowerShell):
  .\.venv\Scripts\Activate.ps1

4) Cài dependencies AI:
  pip install ultralytics opencv-python requests

BƯỚC AI-2 – Chạy sender (webcam hoặc video)
- Chạy webcam (camera 0) và gửi lên backend:
  python sender.py --backend http://localhost:5000 --source 0

- Chạy từ file video demo:
  python sender.py --backend http://localhost:5000 --source D:\code_khoa\backend\video_demo.mp4

- Chạy chế độ mock (không cần camera, gửi số ngẫu nhiên để test):
  python sender.py --backend http://localhost:5000 --mock

BƯỚC AI-3 – (Tuỳ chọn) Calibrate vùng ghế từ video
Mục đích:
- Tạo file JSON vùng ghế (seat zones) để AI xác định ghế nào đang có người.

Ví dụ lệnh (dùng đường dẫn tuyệt đối để tránh lỗi path):
  cd /d D:\code_khoa\backend\ai\yolov8
  .\.venv\Scripts\Activate.ps1
  python calibrate.py --source D:\code_khoa\backend\video_demo.mp4 --out seat_zones_floor1.json --seat FD-2

6) Các URL kiểm tra nhanh
- Backend health (Postgres): http://localhost:5000/health
- Integration health:         http://localhost:5000/api/integration/health
- Admin UI:                  http://localhost:5174
- User UI:                   http://localhost:3000
- pgAdmin (tuỳ chọn):         http://localhost:9090

7) Lỗi thường gặp & cách xử lý
- Lỗi trùng cổng (port in use):
  + Dừng các tiến trình node đang chạy (PowerShell):
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
  + Chạy lại backend/frontend.

- Backend không kết nối được DB:
  + Kiểm tra Docker Desktop đã chạy.
  + Kiểm tra container Postgres:
    cd /d D:\code_khoa\backend
    docker-compose ps
  + Mở http://localhost:5000/health để xem trạng thái DB.

- Frontend gọi API bị CORS:
  + Kiểm tra backend\.env có ALLOWED_ORIGINS gồm http://localhost:3000 và http://localhost:5174
  + Khởi động lại backend sau khi đổi .env.

8) Hướng dẫn đóng gói nộp trường (không kèm tools phát triển)
Khi nộp source code, KHÔNG nên kèm các thư mục/phần sau vì là dependencies hoặc build artifacts:
- node_modules/ (backend, frontend_admin, frontend_user)
- backend/ai/yolov8/.venv/ (môi trường ảo Python)
- build/ (frontend_admin/build, frontend_user/build nếu có)
- tmp/, uploads/ (nếu có dữ liệu phát sinh)

Khuyến nghị: nén (zip) toàn bộ source, loại trừ các thư mục trên.

9) Ghi chú về MongoDB
- Trong phiên bản hiện tại, hệ thống đã chuyển sang PostgreSQL là chính.
- Endpoint /api/integration/health trả legacyMongoRemoved=true (Mongo legacy đã gỡ).

Hết.
