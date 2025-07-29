# 🔧 Khắc phục lỗi gửi mail

## ❌ **Vấn đề hiện tại:**
- EmailJS đang sử dụng **Public Key giả** trong `frontend/src/services/emailService.ts`
- Cần cập nhật **Public Key thật** từ EmailJS Dashboard

## ✅ **Cách khắc phục:**

### **Bước 1: Lấy Public Key thật**
1. Đăng nhập [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click **"Account"** → **"API Keys"**
3. Copy **Public Key**

### **Bước 2: Cập nhật cấu hình**
Mở file `frontend/src/services/emailService.ts` và thay đổi:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw', // ✅ Đã đúng
  TEMPLATE_ID: 'template_mk5ebrk', // ✅ Đã đúng  
  PUBLIC_KEY: 'YOUR_REAL_PUBLIC_KEY_HERE' // ⚠️ THAY BẰNG KEY THẬT
};
```

### **Bước 3: Test**
1. Chạy frontend: `npm run dev`
2. Đặt hàng bình thường
3. Email sẽ được gửi tự động khi đặt hàng thành công

## 🎯 **Kết quả:**
- ✅ Email xác nhận đơn hàng sẽ được gửi tự động
- ✅ Không cần file test riêng
- ✅ Hoạt động cho cả COD và MoMo 