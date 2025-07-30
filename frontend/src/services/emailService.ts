import emailjs from '@emailjs/browser';

// Cấu hình EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_qi4c4fw',
  TEMPLATE_ID: 'template_mk5ebrk',
  PUBLIC_KEY: 'Swpu9Iyd6YA9wadVX' // ⚠️ CẦN THAY BẰNG PUBLIC KEY THẬT
};

// Gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (orderData: any) => {
  try {
    console.log('📧 Starting email send...');
    console.log('📧 Order data:', orderData);
    
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
      to_email: orderData.customer?.email || orderData.email,
      to_name: orderData.customer?.name || orderData.name,
      order_id: orderData._id || orderData.id,
      order_date: new Date(orderData.created_at || Date.now()).toLocaleString('vi-VN'),
      total_amount: (orderData.total || 0).toLocaleString('vi-VN'),
      customer_address: orderData.customer?.address || orderData.address || 'N/A',
      customer_phone: orderData.customer?.phone || orderData.phone || 'N/A',
      payment_method: orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
      status: orderData.status === 'pending' ? 'Đang xử lý' : orderData.status === 'paid' ? 'Đã thanh toán' : orderData.status,
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer?.email || orderData.email,
      name: orderData.customer?.name || orderData.name,
      phone: orderData.customer?.phone || orderData.phone,
      address: orderData.customer?.address || orderData.address,
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