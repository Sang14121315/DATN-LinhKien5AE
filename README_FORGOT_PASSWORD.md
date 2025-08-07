# Hệ thống Forgot Password - Laptop Store

## Tổng quan

Hệ thống forgot password mới được xây dựng sử dụng mật khẩu ứng dụng của Google để gửi email đặt lại mật khẩu. Hệ thống bao gồm:

### Backend

- **Email Service**: `backend/utils/forgotPasswordEmailService.js`
- **Controller**: `backend/controllers/forgotPasswordController.js`
- **Routes**: Cập nhật trong `backend/routes/index.js`

### Frontend

- **Forgot Password Page**: `frontend/src/pages/user/ForgotPasswordPage.tsx`
- **Reset Password Page**: `frontend/src/pages/user/ResetPasswordPage.tsx`
- **API**: Cập nhật trong `frontend/src/api/user/userAPI.ts`

## Cấu hình Email

### Thông tin Email

- **Email**: ngtien.2610@gmail.com
- **Mật khẩu ứng dụng**: chhz oftf ymsd vlxp

### Cách tạo mật khẩu ứng dụng Google

1. Vào Google Account Settings
2. Bật 2-Step Verification
3. Tạo App Password cho ứng dụng
4. Sử dụng mật khẩu ứng dụng thay vì mật khẩu chính

## API Endpoints

### 1. Gửi email forgot password

```
POST /forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi thành công. Vui lòng kiểm tra hộp thư của bạn."
}
```

### 2. Verify reset token

```
GET /verify-reset-token/:token
```

**Response:**

```json
{
  "success": true,
  "message": "Token hợp lệ",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### 3. Reset password

```
POST /reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "NewPassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới."
}
```

## Tính năng

### 1. Email Templates

- **Forgot Password Email**: Template HTML đẹp với thông tin chi tiết
- **Reset Success Email**: Thông báo đặt lại mật khẩu thành công

### 2. Validation

- **Email validation**: Kiểm tra định dạng email
- **Password validation**: Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa, 1 chữ thường, 1 số
- **Token validation**: Kiểm tra token có hợp lệ và chưa hết hạn

### 3. Security

- **Token expiration**: Token hết hạn sau 1 giờ
- **Secure password hashing**: Sử dụng bcrypt để hash mật khẩu
- **Email verification**: Gửi email xác nhận khi đặt lại mật khẩu thành công

### 4. User Experience

- **Loading states**: Hiển thị loading khi đang xử lý
- **Error handling**: Thông báo lỗi rõ ràng
- **Success feedback**: Thông báo thành công
- **Responsive design**: Giao diện đẹp trên mọi thiết bị

## Cách sử dụng

### 1. Khởi động Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Test Email Service

```bash
cd backend
node test-email.js
```

## Luồng hoạt động

1. **User nhập email** → ForgotPasswordPage
2. **Backend kiểm tra email** → Tìm user trong database
3. **Tạo reset token** → JWT với thời hạn 1 giờ
4. **Gửi email** → Template HTML đẹp với link reset
5. **User click link** → Chuyển đến ResetPasswordPage
6. **Verify token** → Kiểm tra token có hợp lệ
7. **User nhập mật khẩu mới** → Validation password
8. **Reset password** → Hash password mới và lưu vào database
9. **Gửi email thông báo** → Email xác nhận thành công
10. **Redirect to login** → Chuyển về trang đăng nhập

## Troubleshooting

### Lỗi gửi email

- Kiểm tra mật khẩu ứng dụng Google
- Kiểm tra kết nối internet
- Kiểm tra logs trong console

### Lỗi token

- Token có thể đã hết hạn (1 giờ)
- Token không hợp lệ
- User không tồn tại

### Lỗi validation

- Email không đúng định dạng
- Password không đủ mạnh
- Confirm password không khớp

## Files đã tạo/cập nhật

### Backend

- `backend/utils/forgotPasswordEmailService.js` (mới)
- `backend/controllers/forgotPasswordController.js` (mới)
- `backend/services/userService.js` (cập nhật)
- `backend/routes/index.js` (cập nhật)
- `backend/test-email.js` (mới)

### Frontend

- `frontend/src/pages/user/ResetPasswordPage.tsx` (mới)
- `frontend/src/pages/user/ForgotPasswordPage.tsx` (cập nhật)
- `frontend/src/api/user/userAPI.ts` (cập nhật)
- `frontend/src/router/index.router.tsx` (cập nhật)
- `frontend/src/styles/pages/user/resetPassword.scss` (mới)
- `frontend/src/styles/pages/user/forgotPassword.scss` (cập nhật)

