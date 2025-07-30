# Hướng dẫn cấu hình EmailJS cho hệ thống

## 🔧 **Bước 1: Cấu hình EmailJS Dashboard**

### 1.1. Tạo Email Service
1. Đăng nhập vào [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click **"Email Services"** trong sidebar
3. Click **"+ Add New Service"**
4. Chọn **"Gmail"**
5. Đặt tên: `linhkien5anhem`
6. Copy **Service ID**: `service_qi4c4fw`

### 1.2. Tạo Email Template
1. Click **"Email Templates"** trong sidebar
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
            <h1>🎉 Đơn hàng đã được đặt thành công!</h1>
            <p>Mã đơn hàng: #{{order_id}}</p>
        </div>
        
        <div class="content">
            <p>Xin chào <strong>{{to_name}}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại <strong>5AnhEmPC</strong>. Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
            
            <div class="order-info">
                <h3>📋 Thông tin đơn hàng:</h3>
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
                <h3>📞 Liên hệ hỗ trợ:</h3>
                <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:</p>
                <p>📧 Email: support@5anhempc.com</p>
                <p>📞 Hotline: 1900-xxxx</p>
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

### 1.3. Lấy Public Key
1. Click **"Account"** trong sidebar
2. Click **"API Keys"**
3. Copy **Public Key**

## 🔧 **Bước 2: Cập nhật cấu hình trong code**

### 2.1. Cập nhật file `frontend/src/services/emailService.ts`:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw', // Service ID của bạn
  TEMPLATE_ID: 'template_xyz789', // Template ID (thay bằng ID thật)
  PUBLIC_KEY: 'your_public_key_here' // Public Key (thay bằng key thật)
};
```

## 🧪 **Bước 3: Test EmailJS**

### 3.1. Chạy frontend
```bash
cd frontend
npm run dev
```

### 3.2. Test email khi đặt hàng
1. Mở trình duyệt
2. Truy cập: `http://localhost:5173`
3. Thêm sản phẩm vào giỏ hàng
4. Đi đến trang checkout
5. Điền thông tin và đặt hàng
6. Email xác nhận sẽ được gửi tự động
7. Kiểm tra hộp thư (cả spam folder)

## 🔍 **Troubleshooting**

### Lỗi "Invalid Public Key"
- Kiểm tra Public Key có đúng không
- Đảm bảo đã copy đầy đủ key

### Lỗi "Service not found"
- Kiểm tra Service ID có đúng không
- Đảm bảo Email Service đã được tạo

### Lỗi "Template not found"
- Kiểm tra Template ID có đúng không
- Đảm bảo Email Template đã được tạo và save

### Email không nhận được
- Kiểm tra spam folder
- Đảm bảo email đã được nhập đúng
- Kiểm tra console để xem lỗi chi tiết

## 📧 **Các loại email được gửi**

1. **Email xác nhận đơn hàng** - Khi khách hàng đặt hàng thành công (COD hoặc MoMo)

## 🎯 **Kết quả mong đợi**

Sau khi cấu hình thành công:
- ✅ EmailJS sẽ gửi email xác nhận khi đặt hàng
- ✅ Email sẽ có template đẹp với thông tin đơn hàng
- ✅ Không cần cấu hình Gmail App Password
- ✅ Hoạt động ngay lập tức sau khi cấu hình 