# SWSpace Backend (PostgreSQL Only) 🚀

## Tổng quan

Backend hiện đã chuyển hoàn toàn sang **PostgreSQL**. Các thành phần trước đây dùng MongoDB (models Booking, PaymentMethod, QRCode, CheckIn, v.v.) đã bị loại bỏ và thay thế bởi bảng: `bookings`, `user_payment_methods`, `qrcodes`, `qr_checkins`.

Phân tách thư mục chính:
```
backend/
  index.js                # Khởi động server hợp nhất
  config/ (PostgreSQL)    # Kết nối và cấu hình DB Postgres
  userapi/                # Domain User (PostgreSQL repositories)
    repositories/         # user, booking, payment methods, team services
    routes/               # auth, bookings, payment-methods, qr, team
    services/             # emailService, qrService, qrImageService...
    middleware/           # auth, upload
    scripts/              # seed-all-data, test-*, clear-bookings...
```

Port mặc định backend hợp nhất: `5000` (các script mới đều trỏ `http://localhost:5000/api`).

## PostgreSQL Database với Docker

Dự án này sử dụng PostgreSQL database chạy trong Docker container.

## Yêu cầu hệ thống

- Docker Desktop
- Docker Compose
- Node.js (cho backend)

## Cấu trúc thư mục Postgres

```
backend/
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables
├── .env.example               # Environment variables template
├── database/
│   └── init/
│       ├── 01-schema.sql      # Database schema
│       └── 02-data.sql        # Sample data
└── README.md                  # This file
```

## Setup Database

### 1. Khởi động PostgreSQL Database

```bash
# Di chuyển vào thư mục backend
cd d:\code_khoa\backend

# Khởi động database
docker-compose up -d

# Kiểm tra container đang chạy
docker-compose ps
```

### 2. Kiểm tra Database

Database sẽ được tự động tạo với:
- **Database name**: swspace
- **Username**: swspace_user  
- **Password**: swspace_password
- **Port**: 5432 (exposed ra host)

### 3. Truy cập pgAdmin (tùy chọn)

- URL: http://localhost:8080
- Email: admin@swspace.vn
- Password: admin123

### 4. Kết nối từ Node.js

```javascript
// Sử dụng pg (node-postgres)
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'swspace',
  user: process.env.DB_USER || 'swspace_user',
  password: process.env.DB_PASSWORD || 'swspace_password',
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});
```

## Cài đặt Dependencies cho Node.js

```bash
# Cài đặt PostgreSQL driver
npm install pg
npm install --save-dev @types/pg  # Nếu dùng TypeScript

# Cài đặt dotenv để đọc .env file
npm install dotenv

# Cài đặt thêm các package khác nếu cần
npm install express cors helmet morgan
```

## Environment Variables

Copy file `.env.example` thành `.env` và chỉnh sửa theo nhu cầu:

```bash
cp .env.example .env
```

## Database Schema

Schema được tự động tạo khi khởi động container lần đầu, bao gồm:

### Bảng chính:
- `users` - Quản lý người dùng
- `bookings` - Quản lý đặt chỗ
- `payments` - Quản lý thanh toán
- `seats` - Quản lý ghế ngồi
- `rooms` - Quản lý phòng họp
- `zones` - Quản lý khu vực
- `floors` - Quản lý tầng
- `services` - Quản lý dịch vụ
- `service_packages` - Quản lý gói dịch vụ

### Views:
- `v_admin_kpis` - KPIs cho admin
- `v_revenue_daily` - Doanh thu theo ngày
- `v_utilization_daily` - Tỷ lệ sử dụng theo ngày

## Lệnh Docker hữu ích

```bash
# Khởi động database
docker-compose up -d

# Dừng database
docker-compose down

# Xem logs
docker-compose logs postgres

# Truy cập vào PostgreSQL CLI
docker exec -it swspace_postgres psql -U swspace_user -d swspace

# Backup database
docker exec swspace_postgres pg_dump -U swspace_user swspace > backup.sql

# Restore database
docker exec -i swspace_postgres psql -U swspace_user swspace < backup.sql

# Xóa volume (reset database)
docker-compose down -v
```

## Network Configuration

Docker Compose tạo một custom network `swspace_network` với subnet `172.20.0.0/16`. Điều này cho phép:

- Các container giao tiếp với nhau qua tên service
- Isolation network từ host system
- Port mapping để truy cập từ host

## Ports

- **PostgreSQL**: 5432 (mapped to host:5432)
- **pgAdmin**: 8080 (mapped to host:8080)
- **Backend API**: 3000 (sẽ cấu hình sau)

## Troubleshooting

### Container không khởi động được:
```bash
# Kiểm tra logs
docker-compose logs

# Kiểm tra port conflicts
netstat -tulpn | grep 5432
```

### Không kết nối được database:
```bash
# Test connection
docker exec swspace_postgres pg_isready -U swspace_user -d swspace

# Kiểm tra firewall/antivirus
# Đảm bảo port 5432 không bị block
```

### Reset hoàn toàn:
```bash
# Dừng và xóa tất cả
docker-compose down -v
docker-compose up -d
```

## Security Notes

⚠️ **Quan trọng**: Đây là setup cho development. Trong production:

1. Thay đổi tất cả mật khẩu mặc định
2. Sử dụng environment variables an toàn
3. Cấu hình firewall và network security
4. Enable SSL/TLS cho database connection
5. Backup database định kỳ

## User Domain (PostgreSQL)

Các luồng: đăng ký/đăng nhập, tạo/hủy booking, phương thức thanh toán, QR generate/verify/check-in/check-out, team services đều dùng repository PostgreSQL:

| Repository | Bảng chính | Chức năng |
|------------|------------|-----------|
| userRepository | users | Auth, profile |
| bookingRepository | bookings, payments | CRUD booking, xác nhận thanh toán |
| paymentMethodRepository | user_payment_methods, payments | Quản lý phương thức thanh toán user |
| teamServicesRepository | services, service_packages, rooms | Metadata team services |

QR Service dùng các bảng: `bookings`, `qrcodes`, `qr_checkins`.

Scripts cũ phụ thuộc Mongo đã loại bỏ. Có thể thêm scripts seed PG sau (chưa bắt buộc).

### Scan phát hiện hardcode cổng 3001
Đã thêm script `backend/scripts/scan-hardcoded-port.js` để quét chuỗi `localhost:3001` trong backend. Chạy:

```powershell
cd backend
node scripts/scan-hardcoded-port.js
```
Nếu tìm thấy, script sẽ trả về mã thoát 1 và in ra vị trí.

## Chạy Backend Hợp Nhất
```powershell
# Cài dependencies
cd backend
npm install

# Khởi động (port 5000)
npm start
```

## Frontend Tích Hợp
Frontend_user cần trỏ API base vào `http://localhost:5000/api`. Nếu đang hardcode `3001`, sửa lại hoặc dùng biến môi trường (VD: `REACT_APP_API_URL`).

## Dọn dẹp Mongo (Hoàn tất)
Toàn bộ phần phụ thuộc MongoDB đã được loại bỏ hoàn toàn:
- Models Mongo: thay bằng stub ném lỗi nhằm chặn import ngẫu nhiên.
- Cấu hình `config/mongo.js` và `userapi/config/mongo.js`: chuyển sang no-op an toàn.
- Các script Mongo (seed/clear/check/admin/create-sample): đã xóa khỏi `userapi/scripts` để tránh chạy nhầm.
- `routes/integrationRoutes.js`: đã đơn giản hóa, chỉ còn kiểm tra Postgres; các endpoint liên quan Mongo đã loại bỏ.
- Dependencies `mongodb`, `mongoose` đã gỡ khỏi `package.json` (nếu lockfile còn chuỗi là lịch sử; có thể chạy `npm prune`).

Nếu cần phục hồi cho mục đích tham chiếu, sử dụng git history trước khi dọn dẹp.

## Ghi chú Bảo mật
Production cần:
1. JWT_SECRET mạnh.
2. TLS cho Postgres nếu deploy cloud.
3. Rate limiting nâng cao (đã có express-rate-limit cơ bản).
4. Backup định kỳ PostgreSQL.
5. Ẩn thông tin nhạy cảm trong logs.

## Tiếp theo (Roadmap nhỏ)
- Bổ sung test API (supertest) cho các route chính.
- Seed dữ liệu mẫu thuần PG.
- Thêm metrics Prometheus (tùy chọn).
