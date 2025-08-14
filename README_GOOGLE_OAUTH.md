# Google OAuth Login Integration

## Tổng quan

Dự án đã được tích hợp Google OAuth login để người dùng có thể đăng nhập bằng tài khoản Google một cách an toàn và tiện lợi.

## Cấu hình cần thiết

### 1. Google Cloud Console

- **Client ID**: `646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com`
- **Client Secret**: Cần lấy từ Google Cloud Console
- **Authorized Origins**:
  - `http://localhost:3000`
  - `http://localhost:5173`
- **Redirect URIs**:
  - `http://localhost:3000/auth/google/callback`
  - `http://localhost:5173/auth/google/callback`

### 2. Environment Variables (Backend)

Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=646853606141-qlecimj57veel2jusatnn6er8cpmore5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

## Cài đặt Dependencies

### Backend

```bash
cd backend
npm install google-auth-library passport passport-google-oauth20
```

### Frontend

```bash
cd frontend
npm install @react-oauth/google
```

## Cấu trúc Files

### Backend

- `config/googleOAuth.js` - Cấu hình Google OAuth
- `services/googleOAuthService.js` - Service xử lý Google OAuth
- `controllers/googleOAuthController.js` - Controller xử lý API
- `routes/googleOAuth.js` - Routes cho Google OAuth
- `models/User.js` - Model User đã được cập nhật để hỗ trợ Google ID

### Frontend

- `components/user/GoogleLoginButton.tsx` - Component Google Login Button
- `components/user/GoogleLoginButton.scss` - Styles cho Google Login Button
- `types/GoogleOAuth.ts` - TypeScript types
- `api/user/googleOAuthAPI.ts` - API service
- `pages/user/LoginPage.tsx` - Đã tích hợp Google Login Button

## Cách sử dụng

### 1. Khởi động Backend

```bash
cd backend
npm start
```

### 2. Khởi động Frontend

```bash
cd frontend
npm run dev
```

### 3. Truy cập Login Page

- Mở trình duyệt và truy cập: `http://localhost:5173/login`
- Bạn sẽ thấy nút "Đăng nhập bằng Google" bên dưới form đăng nhập thông thường

## Luồng hoạt động

1. **User click "Đăng nhập bằng Google"**
2. **Google OAuth consent screen** hiện ra
3. **User cho phép quyền truy cập**
4. **Google trả về ID token**
5. **Frontend gửi token đến Backend**
6. **Backend verify token và tạo/find user**
7. **Backend trả về JWT token và user data**
8. **Frontend lưu token và redirect user**

## Tính năng

- ✅ **Auto-create user**: Tự động tạo tài khoản mới nếu chưa có
- ✅ **Link existing account**: Liên kết với tài khoản hiện tại nếu email trùng
- ✅ **Secure authentication**: Sử dụng Google OAuth 2.0
- ✅ **JWT integration**: Tích hợp với hệ thống JWT hiện tại
- ✅ **Responsive design**: Hỗ trợ mobile và desktop
- ✅ **Error handling**: Xử lý lỗi một cách graceful

## Troubleshooting

### Lỗi "Invalid Google token"

- Kiểm tra Client ID và Client Secret trong Google Cloud Console
- Đảm bảo Authorized Origins và Redirect URIs đúng

### Lỗi "Google login failed"

- Kiểm tra console browser và server logs
- Đảm bảo backend đang chạy và accessible

### Google button không hiển thị

- Kiểm tra internet connection
- Kiểm tra Google Identity API script loading

## Bảo mật

- **HTTPS required**: Trong production, sử dụng HTTPS
- **Token validation**: Backend validate Google ID token
- **Secure storage**: JWT token được lưu an toàn
- **Rate limiting**: Có thể thêm rate limiting cho API endpoints

## Production Deployment

Khi deploy production, cần:

1. **Cập nhật Google Cloud Console**:

   - Thêm domain thật vào Authorized Origins
   - Cập nhật Redirect URIs

2. **Environment Variables**:

   - Cập nhật `GOOGLE_REDIRECT_URI` với domain thật
   - Sử dụng strong JWT secret

3. **HTTPS**: Đảm bảo sử dụng HTTPS

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. Console logs (browser và server)
2. Network tab trong DevTools
3. Google Cloud Console credentials
4. Environment variables
