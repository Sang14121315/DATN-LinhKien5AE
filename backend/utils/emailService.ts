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
      address: orderData.customer.address
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