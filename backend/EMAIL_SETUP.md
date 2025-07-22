# Hướng dẫn cấu hình Email cho hệ thống

## 1. Cấu hình Gmail

### Bước 1: Bật xác thực 2 yếu tố
1. Đăng nhập vào tài khoản Gmail
2. Vào Settings > Security
3. Bật "2-Step Verification"

### Bước 2: Tạo App Password
1. Sau khi bật 2-Step Verification, vào "App passwords"
2. Chọn "Mail" và "Other (Custom name)"
3. Đặt tên: "5AnhEmPC Email Service"
4. Copy mật khẩu được tạo ra

### Bước 3: Cấu hình biến môi trường
Thêm các biến sau vào file `.env`:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
ADMIN_EMAIL=sanghtps39612@gmail.com

# Frontend URL (để tạo link trong email)
FRONTEND_URL=http://localhost:5173
```

## 2. Các loại email được gửi

### 2.1. Email xác nhận đơn hàng (cho khách hàng)
- **Khi nào gửi**: Khi khách hàng đặt hàng thành công
- **Nội dung**: 
  - Thông tin đơn hàng
  - Chi tiết sản phẩm
  - Địa chỉ giao hàng
  - Thông tin liên hệ hỗ trợ

### 2.2. Email thông báo đơn hàng mới (cho admin)
- **Khi nào gửi**: Khi có đơn hàng mới
- **Nội dung**:
  - Thông tin khách hàng
  - Chi tiết đơn hàng
  - Link quản lý đơn hàng

### 2.3. Email cập nhật trạng thái (cho khách hàng)
- **Khi nào gửi**: Khi trạng thái đơn hàng thay đổi
- **Nội dung**:
  - Trạng thái cũ và mới
  - Thời gian cập nhật
  - Thông tin liên hệ

## 3. Cấu hình bảo mật

### 3.1. Sử dụng App Password
- Không sử dụng mật khẩu Gmail chính
- Chỉ sử dụng App Password được tạo riêng

### 3.2. Bảo vệ file .env
- Không commit file .env lên git
- Thêm .env vào .gitignore

## 4. Test email

### 4.1. Test cấu hình
```javascript
// Thêm vào server.js để test
const EmailService = require('./services/emailService');

// Test gửi email
EmailService.sendOrderConfirmation(testOrder, testDetails, testUser)
  .then(() => console.log('Email sent successfully'))
  .catch(err => console.error('Email error:', err));
```

### 4.2. Kiểm tra logs
- Xem console logs để kiểm tra lỗi email
- Email lỗi không làm gián đoạn quá trình đặt hàng

## 5. Troubleshooting

### 5.1. Lỗi "Invalid login"
- Kiểm tra EMAIL_USER và EMAIL_PASS
- Đảm bảo đã bật 2-Step Verification
- Sử dụng App Password, không phải mật khẩu Gmail

### 5.2. Lỗi "Less secure app access"
- Gmail không còn hỗ trợ "Less secure app access"
- Phải sử dụng App Password

### 5.3. Email không gửi được
- Kiểm tra kết nối internet
- Kiểm tra cấu hình SMTP
- Xem logs để debug

## 6. Tùy chỉnh template email

Các template email được định nghĩa trong `services/emailService.js`:

- `sendOrderConfirmation()`: Email xác nhận đơn hàng
- `sendOrderNotificationToAdmin()`: Email thông báo cho admin
- `sendOrderStatusUpdate()`: Email cập nhật trạng thái

Bạn có thể tùy chỉnh HTML và CSS trong các template này. 