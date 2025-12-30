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
- Giải nén source ở bất kỳ đâu (ví dụ: D:\code_khoa\code_khoa).
- Mở PowerShell (hoặc CMD) với quyền bình thường.
- Trong các lệnh bên dưới, giả sử bạn đang đứng ở THƯ MỤC GỐC dự án (nơi có các thư mục backend/, frontend_user/, frontend_admin/).

BƯỚC 1 – Chạy PostgreSQL bằng Docker
1.1 Mở Docker Desktop và đảm bảo Docker đang chạy.
1.2 Vào thư mục backend và chạy docker-compose:
  cd backend
  docker-compose up -d
  # hoặc (Docker Compose v2)
  # docker compose up -d

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
  cd backend
  copy .env.example .env

2.2 Mở file backend\.env và chỉnh các biến quan trọng:
- PORT=5000
  (Lưu ý: code backend mặc định chạy 5000; nếu để 3000 sẽ dễ lệch với frontend)
- ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174
  (5174 là cổng mặc định của frontend_admin)

BƯỚC 3 – Chạy Backend (Node.js)
3.1 Cài dependencies:
  cd backend
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
  cd backend
  npm run seed:admin

4.2 Script sẽ hỏi email/password. Nếu bấm Enter bỏ trống sẽ dùng mặc định:
- Email: admin@example.com
- Password: password123

Ghi chú: có thể chạy không cần nhập (non-interactive):
  set ADMIN_EMAIL=admin@example.com
  set ADMIN_PASSWORD=password123
  node scripts\seedAdmin.js

BƯỚC 5 – Chạy Frontend người dùng (frontend_user)
5.1 Tạo file cấu hình môi trường (khuyến nghị):
  cd frontend_user
  copy .env.example .env
  # Mặc định file .env.example đã trỏ REACT_APP_API_URL=http://localhost:5000

5.2 Cài và chạy:
  cd frontend_user
  npm install
  npm start

5.3 Truy cập:
- Frontend User: http://localhost:3000

BƯỚC 6 – Chạy Frontend quản trị (frontend_admin)
6.1 Tạo file cấu hình môi trường (khuyến nghị):
  cd frontend_admin
  copy .env.example .env
  # Mặc định .env.example đã có các biến VITE_BACKEND_URL / VITE_API_URL / VITE_API_BASE_URL / VITE_USER_LOGIN_URL

Ghi chú:
- Một số màn hình có hardcode http://localhost:5000 nên nếu chạy backend khác cổng thì cần chỉnh lại.
- frontend_admin chạy cổng 5174 theo cấu hình vite.config.ts.

6.2 Cài và chạy:
  cd frontend_admin
  npm install
  npm run dev

6.3 Truy cập:
- Frontend Admin: http://localhost:5174
- Đăng nhập: hệ thống sẽ redirect sang trang login của frontend_user (http://localhost:3000/login).
  Sau khi đăng nhập bằng tài khoản admin ở BƯỚC 4, mở lại http://localhost:5174.

BƯỚC 7 – Chạy AI YOLOv8 (Python) – gửi dữ liệu lên Backend
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

Nếu PowerShell báo chặn script (ExecutionPolicy), chạy 1 lần cho phiên hiện tại:
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

4) Cài dependencies AI:
  pip install ultralytics opencv-python requests

BƯỚC AI-2 – Chạy sender (webcam hoặc video)
- Chạy webcam (camera 0) và gửi lên backend:
  python sender.py --backend http://localhost:5000 --source 0

- Chạy từ file video demo:
  python sender.py --backend http://localhost:5000 --source <DUONG_DAN_TOI_FILE_VIDEO>.mp4

- Chạy chế độ mock (không cần camera, gửi số ngẫu nhiên để test):
  python sender.py --backend http://localhost:5000 --mock

BƯỚC AI-3 – (Tuỳ chọn) Calibrate vùng ghế từ video
Mục đích:
- Tạo file JSON vùng ghế (seat zones) để AI xác định ghế nào đang có người.

Ví dụ lệnh (dùng đường dẫn tuyệt đối để tránh lỗi path):
  cd backend\ai\yolov8
  .\.venv\Scripts\Activate.ps1
  python calibrate.py --source <DUONG_DAN_TOI_FILE_VIDEO>.mp4 --out seat_zones_floor1.json --seat FD-2

BƯỚC 8 – Các URL kiểm tra nhanh
- Backend health (Postgres): http://localhost:5000/health
- Integration health:         http://localhost:5000/api/integration/health
- Admin UI:                  http://localhost:5174
- User UI:                   http://localhost:3000
- pgAdmin (tuỳ chọn):         http://localhost:9090

BƯỚC 9 – Lỗi thường gặp & cách xử lý
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
