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

### 2.2. Email thông báo đơn hàng mới (cho admin) ✅ ĐÃ IMPLEMENT
- **Khi nào gửi**: Khi có đơn hàng mới
- **Nội dung**:
  - Thông tin khách hàng
  - Chi tiết đơn hàng
  - Link quản lý đơn hàng
- **Template**: `backend/utils/adminOrderNotificationTemplate.html`
- **Function**: `sendOrderNotificationToAdmin()` trong `emailService.js`

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

Tuyệt vời! Tôi thấy bạn đã thành công tạo Email Service trong EmailJS dashboard. Bạn đã có:

- ✅ **Service Name**: `linhkien5anhem`
- ✅ **Service ID**: `service_qi4c4fw`
- ✅ **Gmail Service** đã được cấu hình

##  **Bước tiếp theo - Tạo Email Templates:**

### **1. Tạo Template cho xác nhận đơn hàng:**
1. Click **"Email Templates"** trong sidebar bên trái
2. Click **"+ Create New Template"**
3. Đặt tên: **"Order Confirmation"**
4. Copy template HTML này:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đơn hàng</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Đơn hàng đã được đặt thành công!</h1>
            <p>Mã đơn hàng: #{{order_id}}</p>
        </div>
        
        <div class="content">
            <p>Xin chào <strong>{{to_name}}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại <strong>5AnhEmPC</strong>. Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
            
            <div class="order-info">
                <h3> Thông tin đơn hàng:</h3>
                <p><strong>Mã đơn hàng:</strong> #{{order_id}}</p>
                <p><strong>Ngày đặt:</strong> {{order_date}}</p>
                <p><strong>Phương thức thanh toán:</strong> {{payment_method}}</p>
                <p><strong>Trạng thái:</strong> {{status}}</p>
            </div>

            <div class="order-info">
                <h3>📍 Địa chỉ giao hàng:</h3>
                <p><strong>Người nhận:</strong> {{to_name}}</p>
                <p><strong>Số điện thoại:</strong> {{customer_phone}}</p>
                <p><strong>Email:</strong> {{to_email}}</p>
                <p><strong>Địa chỉ:</strong> {{customer_address}}</p>
            </div>

            <div class="order-info">
                <h3>💰 Tổng tiền:</h3>
                <p><strong>{{total_amount}} VNĐ</strong></p>
            </div>

            <div class="order-info">
                <h3> Liên hệ hỗ trợ:</h3>
                <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:</p>
                <p> Email: support@5anhempc.com</p>
                <p> Hotline: 1900-xxxx</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Trân trọng,<br><strong>Đội ngũ 5AnhEmPC</strong></p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>
```

5. Click **"Save"**
6. Copy **Template ID** (sẽ hiện sau khi save)

### **2. Lấy Public Key:**
1. Click **"Account"** trong sidebar
2. Click **"API Keys"**
3. Copy **Public Key**

### **3. Cập nhật code:**
Sau khi có Template ID và Public Key, cập nhật file `frontend/src/utils/emailService.ts`:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw', // Service ID của bạn
  TEMPLATE_ID: 'template_xyz789', // Template ID (thay bằng ID thật)
  PUBLIC_KEY: 'Swpu9Iyd6YA9wadVX' // Public Key (thay bằng key thật)
};
```

Bạn đã tạo template chưa? Tôi sẽ hướng dẫn bước tiếp theo! 