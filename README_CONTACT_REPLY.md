# 📧 Tính năng Phản hồi Liên hệ qua Email

## 🎯 Mô tả

Tính năng này cho phép admin phản hồi các tin nhắn liên hệ từ khách hàng và tự động gửi email thông báo phản hồi đến khách hàng.

## 🚀 Cách hoạt động

### 1. Khách hàng gửi liên hệ

- Khách hàng điền form liên hệ trên website
- Hệ thống lưu thông tin và gửi thông báo cho admin
- Admin nhận được notification về tin nhắn mới

### 2. Admin phản hồi

- Admin vào trang quản lý liên hệ
- Xem chi tiết tin nhắn của khách hàng
- Nhập nội dung phản hồi
- Nhấn "Gửi phản hồi"

### 3. Gửi email tự động

- Hệ thống tự động gửi email phản hồi đến khách hàng
- Email chứa:
  - Thông tin liên hệ của khách hàng
  - Nội dung tin nhắn gốc
  - Phản hồi từ admin
  - Link liên hệ lại

## 📁 Cấu trúc file

```
backend/
├── utils/
│   └── contactReplyEmailService.js    # Service gửi email phản hồi
├── services/
│   └── ContactService.js              # Cập nhật method reply
├── controllers/
│   └── contactController.js           # Cập nhật replyContact
└── scripts/
    └── testContactReplyEmail.js       # Script test email

frontend/
└── src/pages/admin/
    └── AdminContactPage.tsx           # Cập nhật UI hiển thị trạng thái email
```

## ⚙️ Cấu hình

### Email Service

Sử dụng Gmail SMTP với cấu hình:

- Host: smtp.gmail.com
- Port: 587
- User: ngtien.2610@gmail.com
- Pass: chhz oftf ymsd vlxp (App Password)

### Environment Variables

```env
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

### Test email service

```bash
cd backend
npm run test:contact-reply
```

### Test với email thật

1. Mở file `backend/scripts/testContactReplyEmail.js`
2. Thay đổi email trong `testContactData.email`
3. Chạy script test

## 📧 Template Email

Email phản hồi bao gồm:

- Header với logo 5AELINHKIEN
- Thông tin liên hệ của khách hàng
- Nội dung tin nhắn gốc
- Phản hồi từ admin
- Footer với thông tin liên hệ
- Button "Liên hệ lại"

## 🔧 API Endpoints

### POST /api/contacts/:id/reply

Gửi phản hồi cho liên hệ

**Request:**

```json
{
  "reply": "Nội dung phản hồi từ admin"
}
```

**Response:**

```json
{
  "message": "Đã gửi phản hồi cho khách hàng",
  "contact": { ... },
  "emailStatus": "sent|failed|not_sent",
  "emailSent": true,
  "emailFailed": false
}
```

## 🎨 UI/UX

### Admin Interface

- Hiển thị trạng thái email trong toast message
- ✅ Email gửi thành công
- ⚠️ Email gửi thất bại nhưng phản hồi đã lưu
- ℹ️ Không có email để gửi

### Email Template

- Responsive design
- Màu sắc phù hợp với brand
- Thông tin rõ ràng, dễ đọc
- Call-to-action button

## 🛠️ Troubleshooting

### Email không gửi được

1. Kiểm tra cấu hình SMTP
2. Kiểm tra App Password của Gmail
3. Kiểm tra firewall/antivirus
4. Xem logs trong console

### Lỗi thường gặp

- `ECONNREFUSED`: Kiểm tra kết nối internet
- `535 Authentication failed`: Kiểm tra App Password
- `550 Relaying not allowed`: Kiểm tra cấu hình SMTP

## 📝 Logs

Hệ thống log các thông tin:

- ✅ Email gửi thành công
- ❌ Lỗi gửi email
- 🔧 Quá trình tạo transporter
- 📧 Thông tin email gửi

## 🔄 Workflow

1. **Khách hàng gửi liên hệ** → Hệ thống lưu vào DB
2. **Admin xem danh sách** → Hiển thị các liên hệ chờ xử lý
3. **Admin phản hồi** → Nhập nội dung và gửi
4. **Hệ thống gửi email** → Tự động gửi email phản hồi
5. **Cập nhật trạng thái** → Chuyển sang "replied"
6. **Thông báo kết quả** → Hiển thị trạng thái email cho admin

## 🎯 Tính năng nâng cao

- [ ] Gửi email cho nhiều admin
- [ ] Template email tùy chỉnh
- [ ] Lịch sử email gửi
- [ ] Retry mechanism cho email thất bại
- [ ] Email tracking
- [ ] Auto-reply templates
