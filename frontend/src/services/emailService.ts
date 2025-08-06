import emailjs from "@emailjs/browser";

// Cấu hình EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_qi4c4fw",
  TEMPLATE_ID: "template_mk5ebrk",
  PUBLIC_KEY: "Swpu9Iyd6YA9wadVX", // ⚠️ CẦN THAY BẰNG PUBLIC KEY THẬT
};

// Function chung để chuyển đổi status
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Chờ xử lý',
    'shipping': 'Đang giao hàng',
    'completed': 'Đã giao hàng',
    'canceled': 'Đã hủy',
    'confirmed': 'Đã xác nhận',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy',
    'paid': 'Đã thanh toán',
    'processing': 'Đang xử lý'
  };
  return statusMap[status] || 'Chờ xử lý';
};

// Function chung để tạo message cho status
const getStatusMessage = (status: string) => {
  const messageMap: { [key: string]: string } = {
    'pending': 'Đơn hàng của bạn đang chờ xử lý. Chúng tôi sẽ thông báo khi có cập nhật.',
    'shipping': 'Đơn hàng của bạn đang được giao. Vui lòng chuẩn bị nhận hàng.',
    'completed': 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
    'canceled': 'Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.',
    'confirmed': 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao hàng.',
    'delivered': 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
    'cancelled': 'Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.',
    'paid': 'Đơn hàng của bạn đã được thanh toán thành công.',
    'processing': 'Đơn hàng của bạn đang được xử lý thanh toán.'
  };
  return messageMap[status] || 'Trạng thái đơn hàng đã được cập nhật.';
};

// Gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (orderData: any) => {
  try {
<<<<<<< HEAD
    console.log("📧 Starting email send...");
    console.log("📧 Order data:", orderData);

    // Tạo HTML cho danh sách sản phẩm
    const productsHtml =
      orderData.items
        ?.map(
          (item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: center;">
          <img src="${item.img_url || ""}" alt="${
            item.name
          }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        </td>
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${item.price?.toLocaleString(
          "vi-VN"
        )} VNĐ</td>
        <td style="padding: 10px; text-align: right;">${(
          item.price * item.quantity
        )?.toLocaleString("vi-VN")} VNĐ</td>
      </tr>
    `
        )
        .join("") || "";
=======
    console.log('📧 Starting email send...');
    console.log('📧 Order data:', orderData);
    
    // Tạo danh sách sản phẩm dưới dạng text thuần túy
    const productsText = orderData.items?.map((item: any, index: number) => 
      `${index + 1}. ${item.name}
Số lượng: ${item.quantity} x ${item.price?.toLocaleString('vi-VN')} VNĐ
Thành tiền: ${(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ

`
    ).join('') || '';

    // Đảm bảo status có giá trị
    const orderStatus = orderData.status || 'pending';
    const statusText = getStatusText(orderStatus);
>>>>>>> main

    const templateParams = {
      to_email: orderData.customer?.email || orderData.email,
      to_name: orderData.customer?.name || orderData.name,
      order_id: orderData._id || orderData.id,
<<<<<<< HEAD
      order_date: new Date(orderData.created_at || Date.now()).toLocaleString(
        "vi-VN"
      ),
      total_amount: (orderData.total || 0).toLocaleString("vi-VN"),
      customer_address:
        orderData.customer?.address || orderData.address || "N/A",
      customer_phone: orderData.customer?.phone || orderData.phone || "N/A",
      payment_method:
        orderData.payment_method === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Chuyển khoản ngân hàng",
      status:
        orderData.status === "pending"
          ? "Đang xử lý"
          : orderData.status === "paid"
          ? "Đã thanh toán"
          : orderData.status,
=======
      order_date: new Date(orderData.created_at || Date.now()).toLocaleString('vi-VN'),
      total_amount: (orderData.total || 0).toLocaleString('vi-VN'),
      customer_address: orderData.customer?.address || orderData.address || 'N/A',
      customer_phone: orderData.customer?.phone || orderData.phone || 'N/A',
      payment_method: orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
      status: statusText,
>>>>>>> main
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer?.email || orderData.email,
      name: orderData.customer?.name || orderData.name,
      phone: orderData.customer?.phone || orderData.phone,
      address: orderData.customer?.address || orderData.address,
      // Thêm danh sách sản phẩm
<<<<<<< HEAD
      products_html: productsHtml,
      products_count: orderData.items?.length || 0,
    };

    console.log("📧 Template params:", templateParams);
=======
      products_text: productsText,
      products_count: orderData.items?.length || 0
    };

    console.log('📧 Template params:', templateParams);
    console.log('📧 Status:', orderStatus, '->', statusText);
    console.log('📧 Products Text:', productsText);
>>>>>>> main

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log("✅ Email sent successfully:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error };
  }
};

// Gửi email cập nhật trạng thái đơn hàng
export const sendOrderStatusUpdateEmail = async (orderData: any, oldStatus: string, newStatus: string) => {
  try {
<<<<<<< HEAD
    console.log("🧪 Testing simple email to:", email);

    const testData = {
      to_email: email,
      to_name: "Test User",
      message: "This is a test email from 5AnhEmPC",
      email: email,
      name: "Test User",
    };

    console.log("📧 Test data:", testData);
=======
    console.log('📧 Starting status update email...');
    console.log('📧 Order data:', orderData);
    console.log('📧 Status change:', oldStatus, '->', newStatus);
    
    // Tạo danh sách sản phẩm dưới dạng text thuần túy
    const productsText = orderData.items?.map((item: any, index: number) => 
      `${index + 1}. ${item.name}
Số lượng: ${item.quantity} x ${item.price?.toLocaleString('vi-VN')} VNĐ
Thành tiền: ${(item.price * item.quantity)?.toLocaleString('vi-VN')} VNĐ

`
    ).join('') || '';

    // Đảm bảo status có giá trị
    const oldStatusText = getStatusText(oldStatus);
    const newStatusText = getStatusText(newStatus);

    const templateParams = {
      to_email: orderData.customer?.email || orderData.email,
      to_name: orderData.customer?.name || orderData.name,
      order_id: orderData._id || orderData.id,
      order_date: new Date(orderData.created_at || Date.now()).toLocaleString('vi-VN'),
      total_amount: (orderData.total || 0).toLocaleString('vi-VN'),
      customer_address: orderData.customer?.address || orderData.address || 'N/A',
      customer_phone: orderData.customer?.phone || orderData.phone || 'N/A',
      payment_method: orderData.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
      old_status: oldStatusText,
      new_status: newStatusText,
      status: newStatusText, // Thêm status mới
      status_message: getStatusMessage(newStatus),
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer?.email || orderData.email,
      name: orderData.customer?.name || orderData.name,
      phone: orderData.customer?.phone || orderData.phone,
      address: orderData.customer?.address || orderData.address,
      // Thêm danh sách sản phẩm
      products_text: productsText,
      products_count: orderData.items?.length || 0
    };

    console.log('📧 Template params:', templateParams);
    console.log('📧 Status change:', oldStatusText, '->', newStatusText);
    console.log('📧 Products Text:', productsText);
>>>>>>> main

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

<<<<<<< HEAD
    console.log("✅ Simple test email sent:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error("❌ Simple test email error:", error);
=======
    console.log('✅ Status update email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Status update email error:', error);
>>>>>>> main
    return { success: false, error };
  }
};
