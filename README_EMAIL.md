# 📧 Chức năng Gửi Email - 5AnhEmPC

## 🎯 Tổng quan

Hệ thống đã được tích hợp chức năng gửi email tự động cho các sự kiện liên quan đến đơn hàng:

### ✅ Các loại email đã được triển khai:

1. **Email xác nhận đơn hàng** (cho khách hàng)
2. **Email thông báo đơn hàng mới** (cho admin)
3. **Email cập nhật trạng thái đơn hàng** (cho khách hàng)

## 🚀 Cách sử dụng

### 1. Cấu hình Email

#### Bước 1: Tạo App Password Gmail
1. Đăng nhập Gmail
2. Vào Settings > Security
3. Bật "2-Step Verification"
4. Tạo App Password cho "Mail"

#### Bước 2: Cấu hình biến môi trường
Thêm vào file `.env` trong thư mục `backend/`:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
ADMIN_EMAIL=sanghtps39612@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

### 2. Khởi động hệ thống

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### 3. Test chức năng email

#### Cách 1: Test qua API
```bash
curl -X POST http://localhost:5000/api/test/test-email
```

#### Cách 2: Test qua Frontend
1. Truy cập: `http://localhost:5173/admin/email-test`
2. Nhấn nút "Test Gửi Email"

## 📋 Chi tiết các loại email

### 1. Email xác nhận đơn hàng
- **Khi nào gửi**: Khi khách hàng đặt hàng thành công (COD hoặc MoMo)
- **Người nhận**: Khách hàng (lấy từ form thanh toán)
- **Nội dung**:
  - Thông tin đơn hàng
  - Chi tiết sản phẩm
  - Địa chỉ giao hàng
  - Thông tin liên hệ hỗ trợ

### 2. Email thông báo đơn hàng mới
- **Khi nào gửi**: Khi có đơn hàng mới
- **Người nhận**: Admin (lấy từ database hoặc biến môi trường)
- **Nội dung**:
  - Thông tin khách hàng
  - Chi tiết đơn hàng
  - Link quản lý đơn hàng

### 3. Email cập nhật trạng thái
- **Khi nào gửi**: Khi trạng thái đơn hàng thay đổi
- **Người nhận**: Khách hàng (lấy từ form thanh toán)
- **Nội dung**:
  - Trạng thái cũ và mới
  - Thời gian cập nhật
  - Thông tin liên hệ

## 🔧 Cấu trúc code

### Backend
```
backend/
├── services/
│   └── emailService.js          # Service gửi email
├── controllers/
│   └── orderController.js       # Tích hợp gửi email
├── routes/
│   └── testEmail.js            # Route test email
└── EMAIL_SETUP.md              # Hướng dẫn chi tiết
```

### Frontend
```
frontend/
├── components/admin/
│   └── EmailTest.tsx           # Component test email
└── pages/admin/
    └── EmailTestPage.tsx       # Trang test email
```

## 🎨 Tùy chỉnh template email

Các template email được định nghĩa trong `backend/services/emailService.js`:

### Template xác nhận đơn hàng
```javascript
static async sendOrderConfirmation(order, orderDetails, user)
```

### Template thông báo admin
```javascript
static async sendOrderNotificationToAdmin(order, orderDetails, user)
```

### Template cập nhật trạng thái
```javascript
static async sendOrderStatusUpdate(order, user, oldStatus, newStatus)
```

Bạn có thể tùy chỉnh HTML và CSS trong các template này.

## 🛡️ Bảo mật

### 1. Sử dụng App Password
- Không sử dụng mật khẩu Gmail chính
- Chỉ sử dụng App Password được tạo riêng

### 2. Bảo vệ thông tin
- Không commit file `.env` lên git
- Thêm `.env` vào `.gitignore`

### 3. Xử lý lỗi
- Email lỗi không làm gián đoạn quá trình đặt hàng
- Logs lỗi được ghi vào console

## 🔍 Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra EMAIL_USER và EMAIL_PASS
- Đảm bảo đã bật 2-Step Verification
- Sử dụng App Password

### Email không gửi được
- Kiểm tra kết nối internet
- Kiểm tra cấu hình SMTP
- Xem logs để debug

### Lỗi "Less secure app access"
- Gmail không còn hỗ trợ tính năng này
- Phải sử dụng App Password

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs trong console
2. Xem file `backend/EMAIL_SETUP.md` để biết thêm chi tiết
3. Đảm bảo đã cấu hình đúng biến môi trường

## 🎉 Kết quả

Sau khi cấu hình thành công:
- **Khách hàng** sẽ nhận email xác nhận khi đặt hàng (email lấy từ form thanh toán)
- **Admin** sẽ nhận thông báo khi có đơn hàng mới (email lấy từ database)
- **Khách hàng** sẽ được thông báo khi trạng thái đơn hàng thay đổi (email lấy từ form thanh toán)
- Hệ thống hoạt động ổn định và bảo mật

## 📧 Cách lấy email

### Email khách hàng:
- **Ưu tiên**: Email nhập trong form thanh toán (`order.customer.email`)
- **Fallback**: Email từ tài khoản user (`user.email`)

### Email admin:
- **Ưu tiên**: Email của tất cả user có role='admin' trong database
- **Fallback**: Email từ biến môi trường `ADMIN_EMAIL` 