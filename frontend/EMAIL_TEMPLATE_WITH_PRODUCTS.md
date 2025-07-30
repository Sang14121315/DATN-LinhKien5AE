# Template Email với Danh sách Sản phẩm

## HTML Template cho EmailJS:

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
        .products-table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 5px; overflow: hidden; }
        .products-table th { background: #667eea; color: white; padding: 12px; text-align: left; }
        .products-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .products-table tr:hover { background: #f8f9fa; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 5px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
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
                <p><strong>Số lượng sản phẩm:</strong> {{products_count}} sản phẩm</p>
            </div>

            <div class="order-info">
                <h3>🛍️ Chi tiết sản phẩm:</h3>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th style="text-align: center;">Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th style="text-align: center;">Số lượng</th>
                            <th style="text-align: right;">Đơn giá</th>
                            <th style="text-align: right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{products_html}}
                    </tbody>
                </table>
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

## Cách sử dụng:

1. **Copy template HTML** trên vào EmailJS Dashboard
2. **Tạo template mới** với tên "Order Confirmation with Products"
3. **Lấy Template ID** mới
4. **Cập nhật** `TEMPLATE_ID` trong `emailService.ts`

## Biến được sử dụng:

- `{{order_id}}` - Mã đơn hàng
- `{{to_name}}` - Tên khách hàng
- `{{order_date}}` - Ngày đặt hàng
- `{{payment_method}}` - Phương thức thanh toán
- `{{status}}` - Trạng thái đơn hàng
- `{{products_count}}` - Số lượng sản phẩm
- `{{products_html}}` - HTML danh sách sản phẩm
- `{{total_amount}}` - Tổng tiền
- `{{customer_phone}}` - Số điện thoại
- `{{to_email}}` - Email khách hàng
- `{{customer_address}}` - Địa chỉ giao hàng 