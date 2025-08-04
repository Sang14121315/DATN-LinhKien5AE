const emailjs = require('@emailjs/browser');

// Cấu hình EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw', // Service ID của bạn
  TEMPLATE_ID: 'template_mk5ebrk', // Template ID của bạn
  PUBLIC_KEY: 'Swpu9Iyd6YA9wadVX' // ⚠️ THAY BẰNG PUBLIC KEY THẬT
};

// Debug: Log cấu hình
console.log('🔧 EmailJS Config:', EMAILJS_CONFIG);

// Gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    console.log('📧 Starting email send...');
    console.log('📧 Order data:', orderData);
    console.log('📧 Config:', EMAILJS_CONFIG);
    
    // Tạo HTML cho danh sách sản phẩm
    const productsHtml = orderData.items?.map((item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: center;">
          <img src="${item.img_url || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${item.price?.toLocaleString('vi-VN')} VNĐ</td>
        <td style="padding: 10px; text-align: right;">${(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('') || '';
    
    const templateParams = {
      to_email: orderData.customer.email,
      to_name: orderData.customer.name,
      order_id: orderData._id,
      order_date: new Date(orderData.created_at).toLocaleString('vi-VN'),
      total_amount: orderData.total.toLocaleString('vi-VN'),
      customer_address: orderData.customer.address,
      customer_phone: orderData.customer.phone,
      payment_method: orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
      status: orderData.status === 'pending' ? 'Đang xử lý' : orderData.status === 'paid' ? 'Đã thanh toán' : orderData.status,
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer.email,
      name: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      // Thêm danh sách sản phẩm
      products_html: productsHtml,
      products_count: orderData.items?.length || 0
    };

    console.log('📧 Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
  }
};

// Test gửi email đơn giản
const testSimpleEmail = async (email) => {
  try {
    console.log('🧪 Testing simple email to:', email);
    
    const testData = {
      to_email: email,
      to_name: 'Test User',
      message: 'This is a test email from 5AnhEmPC',
      email: email,
      name: 'Test User'
    };

    console.log('📧 Test data:', testData);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      testData,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Simple test email sent:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Simple test email error:', error);
    return { success: false, error };
  }
};

// Gửi email cập nhật trạng thái đơn hàng
const sendOrderStatusUpdateEmail = async (orderData, oldStatus, newStatus) => {
  try {
    console.log('📧 Starting status update email...');
    console.log('📧 Order data:', orderData);
    console.log('📧 Status change:', oldStatus, '->', newStatus);
    
    // Tạo HTML cho danh sách sản phẩm
    const productsHtml = orderData.items?.map((item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: center;">
          <img src="${item.img_url || ''}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${item.price?.toLocaleString('vi-VN')} VNĐ</td>
        <td style="padding: 10px; text-align: right;">${(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ</td>
      </tr>
    `).join('') || '';

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'Đang xử lý',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy',
        'paid': 'Đã thanh toán',
        'processing': 'Đang xử lý'
      };
      return statusMap[status] || status;
    };

    const templateParams = {
      to_email: orderData.customer.email,
      to_name: orderData.customer.name,
      order_id: orderData._id,
      order_date: new Date(orderData.created_at).toLocaleString('vi-VN'),
      total_amount: orderData.total.toLocaleString('vi-VN'),
      customer_address: orderData.customer.address,
      customer_phone: orderData.customer.phone,
      payment_method: orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
      old_status: getStatusText(oldStatus),
      new_status: getStatusText(newStatus),
      status_message: getStatusMessage(newStatus),
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer.email,
      name: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      // Thêm danh sách sản phẩm
      products_html: productsHtml,
      products_count: orderData.items?.length || 0
    };

    console.log('📧 Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Status update email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Status update email error:', error);
    return { success: false, error };
  }
};

const getStatusMessage = (status) => {
  const messageMap = {
    'pending': 'Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ thông báo khi có cập nhật.',
    'confirmed': 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao hàng.',
    'shipping': 'Đơn hàng của bạn đang được giao. Vui lòng chuẩn bị nhận hàng.',
    'delivered': 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
    'cancelled': 'Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.',
    'paid': 'Đơn hàng của bạn đã được thanh toán thành công.',
    'processing': 'Đơn hàng của bạn đang được xử lý thanh toán.'
  };
  return messageMap[status] || 'Trạng thái đơn hàng đã được cập nhật.';
};

module.exports = {
  sendOrderConfirmationEmail,
  testSimpleEmail,
  sendOrderStatusUpdateEmail
}; 