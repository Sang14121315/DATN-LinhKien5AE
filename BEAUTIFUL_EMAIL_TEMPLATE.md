# Template Email Đẹp với Hình Ảnh cho EmailJS

Template này có hình ảnh sản phẩm và layout đẹp mắt:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đơn hàng</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 650px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 600;
        }
        .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9;
        }
        .content { 
            padding: 30px 20px; 
            background: white;
        }
        .order-info { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
        }
        .order-info h3 { 
            margin: 0 0 15px 0; 
            color: #333; 
            font-size: 18px;
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 14px; 
            padding: 20px;
            background: #f8f9fa;
        }
        
        /* Danh sách sản phẩm đẹp */
        .product-list { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border: 1px solid #eee;
        }
        .product-item { 
            display: flex; 
            align-items: center; 
            padding: 15px; 
            margin: 10px 0; 
            background: #f8f9fa; 
            border-radius: 8px; 
            border: 1px solid #e9ecef;
            gap: 15px;
        }
        .product-img { 
            width: 80px; 
            height: 80px; 
            object-fit: cover; 
            border-radius: 8px; 
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex-shrink: 0;
        }
        .product-details { 
            flex: 1;
        }
        .product-name { 
            font-weight: 600; 
            color: #333; 
            font-size: 16px; 
            margin-bottom: 8px;
        }
        .product-info { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px;
        }
        .product-price { 
            color: #e74c3c; 
            font-weight: 600; 
            font-size: 15px;
        }
        .product-total { 
            color: #27ae60; 
            font-weight: 600; 
            font-size: 16px;
            text-align: right;
            margin-left: auto;
        }
        .product-quantity { 
            background: #667eea; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            font-weight: 600;
            display: inline-block;
            margin-right: 10px;
        }
        
        /* Responsive cho mobile */
        @media only screen and (max-width: 600px) {
            .container { 
                margin: 10px; 
                border-radius: 8px;
            }
            .header { 
                padding: 20px 15px; 
            }
            .header h1 { 
                font-size: 24px; 
            }
            .content { 
                padding: 20px 15px; 
            }
            .product-item { 
                flex-direction: column; 
                text-align: center;
                gap: 10px;
            }
            .product-img { 
                width: 100px; 
                height: 100px; 
            }
            .product-total { 
                text-align: center; 
                margin-left: 0;
            }
        }
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
            <p>Cảm ơn bạn đã đặt hàng tại <strong>5AnhEm</strong>. Chúng tôi đã nhận được đơn hàng của bạn và {{status}} .</p>
            
            <div class="order-info">
                <h3>📋 Thông tin đơn hàng:</h3>
                <p><strong>Mã đơn hàng:</strong> #{{order_id}}</p>
                <p><strong>Ngày đặt:</strong> {{order_date}}</p>
                <p><strong>Phương thức thanh toán:</strong> {{payment_method}}</p>
                <p><strong>Trạng thái:</strong> {{status}}</p>
                <p><strong>Số lượng sản phẩm:</strong> {{products_count}} sản phẩm</p>
            </div>

            <div class="order-info">
                <h3>🛍️ Danh sách sản phẩm:</h3>
                <div class="product-list">
{{products_html}}
                </div>
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
                <p><strong style="font-size: 18px; color: #27ae60;">{{total_amount}} VNĐ</strong></p>
            </div>

            <div class="order-info">
                <h3>📞 Liên hệ hỗ trợ:</h3>
                <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:</p>
                <p>📧 Email: support@5anhem.com</p>
                <p>📞 Hotline: 0349910814</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Trân trọng,<br><strong>Đội ngũ 5AnhEm</strong></p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>
```

## 📧 Cách sử dụng:

### **1. Template Variables:**
- `{{to_name}}` - Tên khách hàng
- `{{to_email}}` - Email khách hàng
- `{{order_id}}` - Mã đơn hàng
- `{{order_date}}` - Ngày đặt hàng
- `{{payment_method}}` - Phương thức thanh toán
- `{{status}}` - Trạng thái đơn hàng
- `{{customer_phone}}` - Số điện thoại
- `{{customer_address}}` - Địa chỉ giao hàng
- `{{total_amount}}` - Tổng tiền
- `{{products_count}}` - Số lượng sản phẩm
- `{{products_html}}` - Danh sách sản phẩm với hình ảnh

### **2. Cập nhật emailService để tạo products_html:**

```typescript
// Tạo danh sách sản phẩm với hình ảnh đẹp
const productsHtml = orderData.items?.map((item: any, index: number) => `
  <div class="product-item">
    <img src="${item.img_url || 'https://via.placeholder.com/80x80?text=No+Image'}" alt="${item.name}" class="product-img">
    <div class="product-details">
      <div class="product-name">${index + 1}. ${item.name}</div>
      <div class="product-info">
        <span class="product-quantity">${item.quantity}</span>
        Số lượng: ${item.quantity} x ${item.price?.toLocaleString('vi-VN')} VNĐ
      </div>
      <div class="product-price">Đơn giá: ${item.price?.toLocaleString('vi-VN')} VNĐ</div>
    </div>
    <div class="product-total">${(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ</div>
  </div>
`).join('') || '';

// Thay thế products_text bằng products_html
const templateParams = {
  // ... other params
  products_html: productsHtml,
  // ... other params
};
```

Template này sẽ hiển thị sản phẩm với hình ảnh đẹp mắt và layout card! 