# 📧 Admin Notification Email Service

## Tổng quan

Tính năng này sẽ tự động gửi email thông báo cho admin khi có user gửi contact form mới.

## 🚀 Tính năng

### 1. Gửi email thông báo cho admin cụ thể

- **Tự động**: Khi user submit contact form
- **Nội dung**: Thông tin chi tiết về contact của user
- **Đối tượng**: Admin có email cụ thể (ngtien.2610@gmail.com)
- **Template**: Email HTML đẹp mắt với thông tin đầy đủ

### 2. Thông tin trong email

- 👤 **Thông tin khách hàng**: Tên, email, số điện thoại, tiêu đề
- 💬 **Nội dung tin nhắn**: Message đầy đủ từ user
- ⏰ **Thời gian gửi**: Timestamp chính xác
- 🔗 **Link trực tiếp**: Đi thẳng đến trang admin contacts
- 🚨 **Cảnh báo**: Nhắc nhở admin xử lý ngay

## 📁 Cấu trúc file

```
backend/
├── config/
│   └── emailConfig.js                     # Cấu hình email service
├── utils/
│   ├── adminNotificationEmailService.js    # Service gửi email cho admin
│   └── contactReplyEmailService.js        # Service gửi email phản hồi (có sẵn)
├── controllers/
│   └── contactController.js               # Controller đã được cập nhật
├── scripts/
│   └── testAdminNotificationEmail.js      # Script test
└── email.env.example                      # File cấu hình mẫu
```

## ⚙️ Cấu hình

### 1. Sử dụng file cấu hình (Khuyến nghị)

```bash
# Copy file cấu hình mẫu
cp backend/email.env.example backend/.env

# Chỉnh sửa thông tin email trong file .env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Cấu hình trực tiếp trong code

```javascript
// Trong backend/config/emailConfig.js
const emailConfig = {
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password",
    },
  },
  // ... các cấu hình khác
};
```

### 3. Environment Variables đầy đủ

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
EMAIL_FROM_NAME=5AELINHKIEN System
EMAIL_FROM_EMAIL=your-email@gmail.com

# URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173/admin

# Retry Settings
EMAIL_MAX_RETRIES=2
EMAIL_RETRY_DELAY=1000

# Timeout Settings
EMAIL_CONNECTION_TIMEOUT=10000
EMAIL_SEND_TIMEOUT=30000
```

## 🧪 Testing

### Chạy test

```bash
cd backend
node scripts/testAdminNotificationEmail.js
```

### Test thủ công

1. Mở trang contact trên frontend
2. Điền form và submit
3. Kiểm tra email admin có nhận được thông báo không

## 📧 Template Email

### Giao diện

- **Header**: Logo và tiêu đề rõ ràng
- **Alert Badge**: Cảnh báo "CẦN XỬ LÝ NGAY"
- **Thông tin khách hàng**: Layout dạng bảng dễ đọc
- **Nội dung tin nhắn**: Box màu vàng nổi bật
- **Button hành động**: Link trực tiếp đến admin panel
- **Footer**: Thông tin liên hệ và lưu ý

### Responsive

- Tối ưu cho mobile và desktop
- Sử dụng CSS Grid và Flexbox
- Font size phù hợp cho mọi thiết bị

## 🔄 Luồng hoạt động

```
User submit contact form
         ↓
   Contact được tạo
         ↓
   Gửi email thông báo
         ↓
   Admin ngtien.2610@gmail.com nhận email
         ↓
   Click link vào admin panel
         ↓
   Xử lý contact
```

## 🛠️ Tích hợp

### Trong contactController.js

```javascript
// Gửi email thông báo cho admin cụ thể
try {
  console.log("🔧 Starting admin notification process...");

  // Gửi email cho admin cụ thể: ngtien.2610@gmail.com
  const targetAdminEmail = "ngtien.2610@gmail.com";
  console.log(`📧 Target admin email: ${targetAdminEmail}`);

  console.log("🔧 Sending admin notification email...");
  const emailResult = await sendAdminNotificationEmail(
    req.body,
    targetAdminEmail
  );

  if (emailResult.success) {
    console.log(
      "✅ Admin notification email sent successfully:",
      emailResult.messageId
    );
  } else {
    console.log("⚠️ Failed to send admin notification email");
  }
} catch (emailError) {
  console.error("❌ Error sending admin notification email:", emailError);
  // Không throw error để không ảnh hưởng đến việc tạo contact
}
```

## 📊 Monitoring

### Logs

- ✅ Success: `Admin notification email sent successfully`
- ❌ Error: `Error sending admin notification email`
- 🔧 Process: `Starting admin notification process...`

### Error Handling

- Email lỗi không ảnh hưởng đến việc tạo contact
- Log đầy đủ thông tin lỗi để debug
- Retry mechanism có thể được thêm sau

## 🚀 Deployment

### Production

1. Cập nhật SMTP credentials
2. Cập nhật URLs trong template
3. Test với email thật
4. Monitor logs và performance

### Security

- Sử dụng App Password thay vì password thường
- Không commit credentials vào code
- Sử dụng environment variables

## 🔧 Troubleshooting

### Email không gửi được

1. **Kiểm tra SMTP credentials**

   - Xác nhận email và app password đúng
   - Kiểm tra 2FA đã được bật cho Gmail
   - Tạo app password mới nếu cần

2. **Kiểm tra kết nối mạng**

   - Firewall/network restrictions
   - Port 587 có bị chặn không
   - DNS resolution

3. **Kiểm tra Gmail settings**

   - Less secure app access (nếu dùng password cũ)
   - App passwords (khuyến nghị)
   - Gmail API settings

4. **Kiểm tra logs**
   - Console logs với level DEBUG
   - SMTP connection errors
   - Authentication errors

### Admin không nhận email

1. **Kiểm tra email admin**

   - Email có đúng format không
   - Email có phải là ngtien.2610@gmail.com không
   - Không cần kiểm tra role trong database

2. **Kiểm tra spam folder**

   - Gmail spam folder
   - Junk mail folder
   - Promotions tab (Gmail)

3. **Kiểm tra email delivery**

   - Console logs success/failure
   - SMTP response codes
   - Email tracking (nếu có)

4. **Test với script**
   ```bash
   cd backend
   node scripts/testAdminNotificationEmail.js
   ```

### Lỗi thường gặp và cách khắc phục

#### ❌ "nodemailer.createTransporter is not a function"

- **Nguyên nhân**: Sai tên function, phải là `createTransport`
- **Khắc phục**: Đã sửa trong code mới

#### ❌ "Authentication failed"

- **Nguyên nhân**: Sai email/password hoặc app password
- **Khắc phục**: Kiểm tra lại credentials, tạo app password mới

#### ❌ "Connection timeout"

- **Nguyên nhân**: Mạng chậm hoặc firewall
- **Khắc phục**: Tăng timeout, kiểm tra network

#### ❌ "Rate limit exceeded"

- **Nguyên nhân**: Gửi quá nhiều email trong thời gian ngắn
- **Khắc phục**: Giảm tần suất gửi, sử dụng email queue

## 📈 Cải tiến tương lai

- [x] Thêm retry mechanism ✅
- [x] Thêm email queue system (parallel processing) ✅
- [x] Thêm email template customization ✅
- [x] Thêm email tracking (detailed logging) ✅
- [ ] Thêm email scheduling
- [ ] Thêm email preferences cho admin
- [ ] Thêm email analytics dashboard
- [ ] Thêm email template editor
- [ ] Thêm email A/B testing
- [ ] Thêm email automation workflows

## 📞 Hỗ trợ

Nếu có vấn đề gì, hãy kiểm tra:

1. Console logs
2. Email service configuration
3. Network connectivity
4. Gmail App Password settings
