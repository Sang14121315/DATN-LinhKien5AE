const nodemailer = require('nodemailer');

class EmailService {
  static transporter = null;

  static getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    return this.transporter;
  }

  // Helper function để lấy danh sách email admin
  static async getAdminEmails() {
    try {
      const UserService = require('./userService');
      const admins = await UserService.getAll({ role: 'admin' });
      
      if (admins.length > 0) {
        const adminEmails = admins.map(admin => admin.email);
        console.log(`📧 Found ${admins.length} admin(s) in database:`, adminEmails);
        return adminEmails;
      } else {
        // Fallback: sử dụng email từ biến môi trường
        const fallbackEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (fallbackEmail) {
          console.log(`📧 Using fallback admin email: ${fallbackEmail}`);
          return [fallbackEmail];
        }
      }
      
      console.error('❌ No admin emails found!');
      return [];
    } catch (error) {
      console.error('❌ Error getting admin emails:', error);
      // Fallback to environment variable
      const fallbackEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      return fallbackEmail ? [fallbackEmail] : [];
    }
  }

  // Gửi email xác nhận đơn hàng cho khách hàng
  static async sendOrderConfirmation(order, orderDetails, user) {
    const transporter = this.getTransporter();
    
    // Ưu tiên email từ form thanh toán, nếu không có thì dùng email user
    const customerEmail = order.customer.email || user?.email;
    
    if (!customerEmail) {
      console.error('❌ Không có email khách hàng để gửi!');
      return false;
    }
    
    const itemsHtml = orderDetails.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.img_url || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toLocaleString('vi-VN')} VNĐ</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Xác nhận đơn hàng #${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #667eea; color: white; padding: 10px; text-align: left; }
          .total { background: #e8f5e8; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: right; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Đơn hàng đã được đặt thành công!</h1>
            <p>Mã đơn hàng: #${order._id}</p>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${order.customer.name}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại <strong>5AnhEmPC</strong>. Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý.</p>
            
            <div class="order-info">
              <h3>📋 Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn hàng:</strong> #${order._id}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(order.created_at).toLocaleString('vi-VN')}</p>
              <p><strong>Phương thức thanh toán:</strong> ${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
              <p><strong>Trạng thái:</strong> ${order.status === 'pending' ? 'Đang xử lý' : order.status === 'paid' ? 'Đã thanh toán' : order.status}</p>
            </div>

            <div class="order-info">
              <h3>📍 Địa chỉ giao hàng:</h3>
              <p><strong>Người nhận:</strong> ${order.customer.name}</p>
              <p><strong>Số điện thoại:</strong> ${order.customer.phone}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Địa chỉ:</strong> ${order.customer.address}</p>
            </div>

            <h3>🛍️ Chi tiết sản phẩm:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 60px;">Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th style="width: 80px;">Số lượng</th>
                  <th style="width: 100px;">Đơn giá</th>
                  <th style="width: 120px;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              <h3>Tổng cộng: ${order.total.toLocaleString('vi-VN')} VNĐ</h3>
            </div>

            <div class="order-info">
              <h3>📞 Liên hệ hỗ trợ:</h3>
              <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:</p>
              <p>📧 Email: support@5anhempc.com</p>
              <p>📞 Hotline: 1900-xxxx</p>
              <p>💬 Chat trực tuyến: Truy cập website của chúng tôi</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Trân trọng,<br><strong>Đội ngũ 5AnhEmPC</strong></p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Xác nhận đơn hàng #${order._id} - 5AnhEmPC`,
        html: emailHtml
      });
      
      console.log(`✅ Email xác nhận đơn hàng đã được gửi đến: ${customerEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi email xác nhận đơn hàng:', error);
      return false;
    }
  }

  // Gửi email thông báo đơn hàng mới cho admin
  static async sendOrderNotificationToAdmin(order, orderDetails, user) {
    const transporter = this.getTransporter();
    
    const itemsHtml = orderDetails.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.price.toLocaleString('vi-VN')} VNĐ</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Đơn hàng mới #${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ff6b6b; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #ff6b6b; color: white; padding: 8px; text-align: left; }
          .total { background: #ffe8e8; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: right; font-weight: bold; }
          .action-btn { display: inline-block; padding: 10px 20px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🆕 Đơn hàng mới!</h1>
            <p>Mã đơn hàng: #${order._id}</p>
          </div>
          
          <div class="content">
            <p>Có đơn hàng mới từ khách hàng <strong>${order.customer.name}</strong>.</p>
            
            <div class="order-info">
              <h3>📋 Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn hàng:</strong> #${order._id}</p>
              <p><strong>Ngày đặt:</strong> ${new Date(order.created_at).toLocaleString('vi-VN')}</p>
              <p><strong>Phương thức thanh toán:</strong> ${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
              <p><strong>Trạng thái:</strong> ${order.status === 'pending' ? 'Đang xử lý' : order.status === 'paid' ? 'Đã thanh toán' : order.status}</p>
            </div>

            <div class="order-info">
              <h3>👤 Thông tin khách hàng:</h3>
              <p><strong>Tên:</strong> ${order.customer.name}</p>
              <p><strong>Số điện thoại:</strong> ${order.customer.phone}</p>
              <p><strong>Email:</strong> ${order.customer.email || 'Không có'}</p>
              <p><strong>Địa chỉ:</strong> ${order.customer.address}</p>
              ${user ? `<p><strong>Tài khoản:</strong> ${user.email} (ID: ${user._id})</p>` : '<p><strong>Tài khoản:</strong> Khách hàng không đăng nhập</p>'}
            </div>

            <h3>🛍️ Chi tiết sản phẩm:</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th style="width: 80px;">Số lượng</th>
                  <th style="width: 100px;">Đơn giá</th>
                  <th style="width: 120px;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total">
              <h3>Tổng cộng: ${order.total.toLocaleString('vi-VN')} VNĐ</h3>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/admin/orders" class="action-btn">Xem chi tiết đơn hàng</a>
              <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="action-btn">Quản lý đơn hàng</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // Lấy danh sách email admin
      const adminEmails = await this.getAdminEmails();
      
      if (adminEmails.length === 0) {
        console.error('❌ No admin emails found!');
        return false;
      }
      
      // Gửi email cho tất cả admin
      for (const adminEmail of adminEmails) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `Đơn hàng mới #${order._id} - ${order.customer.name}`,
          html: emailHtml
        });
        console.log(`✅ Email thông báo đơn hàng mới đã được gửi đến admin: ${adminEmail}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi email thông báo đơn hàng cho admin:', error);
      return false;
    }
  }

  // Gửi email cập nhật trạng thái đơn hàng cho khách hàng
  static async sendOrderStatusUpdate(order, user, oldStatus, newStatus) {
    const transporter = this.getTransporter();
    
    // Ưu tiên email từ form thanh toán, nếu không có thì dùng email user
    const customerEmail = order.customer.email || user?.email;
    
    if (!customerEmail) {
      console.error('❌ Không có email khách hàng để gửi cập nhật trạng thái!');
      return false;
    }
    
    const statusMessages = {
      'pending': 'Đang xử lý',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy',
      'paid': 'Đã thanh toán'
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cập nhật trạng thái đơn hàng #${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .status-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Cập nhật trạng thái đơn hàng</h1>
            <p>Mã đơn hàng: #${order._id}</p>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${order.customer.name}</strong>,</p>
            <p>Đơn hàng của bạn đã được cập nhật trạng thái.</p>
            
            <div class="status-info">
              <h3>🔄 Thông tin cập nhật:</h3>
              <p><strong>Mã đơn hàng:</strong> #${order._id}</p>
              <p><strong>Trạng thái cũ:</strong> ${statusMessages[oldStatus] || oldStatus}</p>
              <p><strong>Trạng thái mới:</strong> ${statusMessages[newStatus] || newStatus}</p>
              <p><strong>Thời gian cập nhật:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <div class="status-info">
              <h3>📞 Liên hệ hỗ trợ:</h3>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
              <p>📧 Email: support@5anhempc.com</p>
              <p>📞 Hotline: 1900-xxxx</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Trân trọng,<br><strong>Đội ngũ 5AnhEmPC</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Cập nhật trạng thái đơn hàng #${order._id} - 5AnhEmPC`,
        html: emailHtml
      });
      
      console.log(`✅ Email cập nhật trạng thái đơn hàng đã được gửi đến: ${customerEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Lỗi gửi email cập nhật trạng thái đơn hàng:', error);
      return false;
    }
  }
}

module.exports = EmailService; 