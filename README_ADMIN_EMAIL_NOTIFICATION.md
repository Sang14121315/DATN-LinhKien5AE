# Tính năng Email Thông báo Đơn hàng Mới cho Admin

## Tổng quan
Hệ thống đã được tích hợp tính năng tự động gửi email thông báo cho admin khi có khách hàng đặt đơn hàng mới. Điều này giúp admin nhanh chóng biết được có đơn hàng mới và xử lý kịp thời.

## Các thành phần đã được cập nhật

### 1. Backend
- **`backend/utils/emailService.js`**: Thêm function `sendOrderNotificationToAdmin()`
- **`backend/controllers/orderController.js`**: Gọi function gửi email khi tạo đơn hàng mới
- **`backend/utils/adminOrderNotificationTemplate.html`**: Template HTML đẹp cho email thông báo

### 2. Logic hoạt động
- Khi khách hàng đặt hàng thành công
- Hệ thống tự động gửi email thông báo cho admin
- Email chứa đầy đủ thông tin đơn hàng và khách hàng

## Cách hoạt động

### 1. Khi khách hàng đặt hàng
```javascript
// Trong createOrder function
try {
  // Gửi email thông báo cho admin
  const orderWithItems = {
    ...order._doc,
    items: detailDocs
  };
  await sendOrderNotificationToAdmin(orderWithItems);
  console.log('✅ Email thông báo đã gửi cho admin');
} catch (emailError) {
  console.error('❌ Lỗi gửi email thông báo cho admin:', emailError);
  // Không dừng quá trình tạo đơn hàng nếu email thất bại
}
```

### 2. Email được gửi đến
- **Email admin**: `sanghtps39612@gmail.com` (cấu hình mặc định)
- **Nội dung**: Thông tin chi tiết đơn hàng mới

### 3. Thông tin trong email
- 📋 **Thông tin đơn hàng**: Mã đơn, ngày đặt, phương thức thanh toán
- 👤 **Thông tin khách hàng**: Tên, SĐT, email, địa chỉ
- 📦 **Chi tiết sản phẩm**: Danh sách sản phẩm, số lượng, giá
- 💰 **Tổng tiền đơn hàng**
- 🔗 **Link quản lý**: Nút truy cập nhanh vào trang admin

## Cấu hình

### 1. EmailJS Configuration
```javascript
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_qi4c4fw",
  TEMPLATE_ID: "template_mk5ebrk", // Template hiện tại
  PUBLIC_KEY: "Swpu9Iyd6YA9wadVX",
};
```

### 2. Email Admin
- **Mặc định**: `sanghtps39612@gmail.com`
- **Có thể thay đổi**: Trong `emailService.js` hoặc thêm vào environment variables

### 3. Template HTML
- **File**: `backend/utils/adminOrderNotificationTemplate.html`
- **Responsive**: Hỗ trợ mobile và desktop
- **Customizable**: Dễ dàng chỉnh sửa giao diện

## Tùy chỉnh

### 1. Thay đổi email admin
```javascript
// Trong sendOrderNotificationToAdmin function
const templateParams = {
  to_email: "your-admin-email@gmail.com", // Thay đổi email ở đây
  // ... other params
};
```

### 2. Thay đổi template
- Chỉnh sửa file `adminOrderNotificationTemplate.html`
- Thay đổi CSS để phù hợp với brand
- Thêm/bớt thông tin hiển thị

### 3. Thêm nhiều admin
```javascript
// Có thể mở rộng để gửi cho nhiều admin
const adminEmails = [
  "admin1@gmail.com",
  "admin2@gmail.com",
  "admin3@gmail.com"
];

for (const email of adminEmails) {
  await sendOrderNotificationToAdmin(orderData, email);
}
```

## Kiểm tra hoạt động

### 1. Test đặt hàng
1. Đăng nhập với tài khoản khách hàng
2. Thêm sản phẩm vào giỏ hàng
3. Tiến hành checkout
4. Kiểm tra email admin có nhận được thông báo không

### 2. Kiểm tra logs
```bash
# Trong console backend
📧 Starting admin notification email...
📧 Order data for admin: {...}
📧 Admin notification template params: {...}
✅ Admin notification email sent successfully: {...}
```

### 3. Kiểm tra email
- Kiểm tra inbox của `sanghtps39612@gmail.com`
- Kiểm tra spam folder nếu không thấy
- Xem nội dung email có đầy đủ thông tin không

## Troubleshooting

### 1. Email không gửi được
- Kiểm tra cấu hình EmailJS
- Kiểm tra internet connection
- Xem logs để debug lỗi

### 2. Template không hiển thị đúng
- Kiểm tra file `adminOrderNotificationTemplate.html`
- Kiểm tra các biến thay thế `{{variable_name}}`
- Xem console logs

### 3. Email admin không đúng
- Kiểm tra email trong `emailService.js`
- Đảm bảo email hợp lệ
- Kiểm tra quyền truy cập email

## Lợi ích

### 1. Cho Admin
- ⚡ **Thông báo tức thì**: Biết ngay khi có đơn hàng mới
- 📱 **Tiện lợi**: Có thể xử lý từ email hoặc mobile
- 📊 **Thông tin đầy đủ**: Không cần vào hệ thống để xem chi tiết
- 🔗 **Truy cập nhanh**: Link trực tiếp vào trang quản lý

### 2. Cho Hệ thống
- 🚀 **Tự động hóa**: Không cần can thiệp thủ công
- 📈 **Hiệu quả**: Giảm thời gian xử lý đơn hàng
- 💼 **Chuyên nghiệp**: Tăng tính chuyên nghiệp của hệ thống

## Kết luận
Tính năng email thông báo cho admin đã được tích hợp hoàn chỉnh và sẵn sàng sử dụng. Admin sẽ nhận được email thông báo đẹp mắt mỗi khi có đơn hàng mới, giúp tăng hiệu quả quản lý và xử lý đơn hàng.
