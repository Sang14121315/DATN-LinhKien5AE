import emailjs from '@emailjs/browser';

// Cấu hình EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw', // Service ID của bạn
  TEMPLATE_ID: 'template_mk5ebrk', // Template ID của bạn
  PUBLIC_KEY: 'Swpu9Iyd6YA9wadVX' // ⚠️ THAY BẰNG PUBLIC KEY THẬT
};

// Debug: Log cấu hình
console.log('🔧 EmailJS Config:', EMAILJS_CONFIG);

// Gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (orderData: any) => {
  try {
    console.log('📧 Starting email send...');
    console.log('📧 Order data:', orderData);
    console.log('📧 Config:', EMAILJS_CONFIG);
    
    // Tạo HTML cho danh sách sản phẩm
    const productsHtml = orderData.items?.map((item: any) => `
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
export const testSimpleEmail = async (email: string) => {
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
export const sendOrderStatusUpdateEmail = async (orderData: any, oldStatus: string, newStatus: string) => {
  try {
    console.log('📧 Starting order status update email...');
    console.log('📧 Order data:', orderData);
    console.log('📧 Status change:', `${oldStatus} -> ${newStatus}`);
    
    // Tạo HTML cho danh sách sản phẩm
    const productsHtml = orderData.items?.map((item: any) => `
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
    
    // Chuyển đổi trạng thái sang tiếng Việt
    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'Đang xử lý';
        case 'paid': return 'Đã thanh toán';
        case 'shipping': return 'Đang giao hàng';
        case 'delivered': return 'Đã giao hàng';
        case 'cancelled': return 'Đã hủy';
        case 'failed': return 'Thất bại';
        default: return status;
      }
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
      status_change: `${getStatusText(oldStatus)} → ${getStatusText(newStatus)}`,
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer.email,
      name: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      // Thêm danh sách sản phẩm
      products_html: productsHtml,
      products_count: orderData.items?.length || 0,
      // Thêm thông tin cập nhật
      update_time: new Date().toLocaleString('vi-VN'),
      status_message: getStatusMessage(newStatus)
    };

    console.log('📧 Template params:', templateParams);

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Order status update email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Order status update email error:', error);
    return { success: false, error };
  }
};

// Hàm tạo thông báo theo trạng thái
const getStatusMessage = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ bắt đầu xử lý và chuẩn bị giao hàng.';
    case 'shipping':
      return 'Đơn hàng của bạn đang được giao. Vui lòng chuẩn bị nhận hàng và kiểm tra thông tin liên lạc.';
    case 'delivered':
      return 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng tại 5AnhEmPC!';
    case 'cancelled':
      return 'Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.';
    case 'failed':
      return 'Đơn hàng của bạn gặp sự cố. Vui lòng liên hệ với chúng tôi để được hỗ trợ.';
    default:
      return 'Trạng thái đơn hàng của bạn đã được cập nhật.';
  }
}; 