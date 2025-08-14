const axios = require("axios");

// Cấu hình EmailJS REST API
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_qi4c4fw",
  TEMPLATE_ID: "template_mk5ebrk",
  PUBLIC_KEY: "Swpu9Iyd6YA9wadVX",
};

// Debug: Log cấu hình
console.log("🔧 EmailJS Config:", EMAILJS_CONFIG);

// Gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    console.log("📧 Starting email send...");
    console.log("📧 Order data:", orderData);
    console.log("📧 Config:", EMAILJS_CONFIG);

    // Tạo HTML cho danh sách sản phẩm
    const productsHtml =
      orderData.items
        ?.map(
          (item) => `
      <tr>
        <td class="image-cell">
          <img src="${
            item.img_url || "https://via.placeholder.com/80x80?text=No+Image"
          }" alt="${item.name}" class="product-img">
        </td>
        <td class="name-cell">
          <div class="product-name">${item.name}</div>
        </td>
        <td class="quantity-cell">
          <span class="quantity">${item.quantity}</span>
        </td>
        <td class="price-cell">
          <div class="product-price">${item.price?.toLocaleString(
            "vi-VN"
          )} VNĐ</div>
        </td>
        <td class="price-cell">
          <div class="product-total">${(
            item.price * item.quantity
          )?.toLocaleString("vi-VN")} VNĐ</div>
        </td>
      </tr>
    `
        )
        .join("") || "";

    const getStatusText = (status) => {
      const statusMap = {
        pending: "Chờ xử lý",
        shipping: "Đang giao hàng",
        completed: "Đã giao hàng",
        canceled: "Đã hủy",
        confirmed: "Đã xác nhận",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        paid: "Đã thanh toán",
        processing: "Đang xử lý",
      };
      return statusMap[status] || status;
    };

    const templateParams = {
      to_email: orderData.customer.email,
      to_name: orderData.customer.name,
      order_id: orderData._id,
      order_date: new Date(orderData.created_at).toLocaleString("vi-VN"),
      total_amount: orderData.total.toLocaleString("vi-VN"),
      customer_address: orderData.customer.address,
      customer_phone: orderData.customer.phone,
      payment_method:
        orderData.payment_method === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Chuyển khoản ngân hàng",
      status: getStatusText(orderData.status || "pending"),
      // Thêm các biến phụ để đảm bảo
      email: orderData.customer.email,
      name: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      // Thêm danh sách sản phẩm
      products_html: productsHtml,
      products_count: orderData.items?.length || 0,
    };

    console.log("📧 Template params:", templateParams);

    // Sử dụng EmailJS REST API
    const response = await axios.post(
      `https://api.emailjs.com/api/v1.0/email/send`,
      {
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: templateParams,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Email error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Gửi email cập nhật trạng thái đơn hàng
const sendOrderStatusUpdateEmail = async (orderData, oldStatus, newStatus) => {
  try {
    console.log("📧 Starting status update email...");
    console.log("📧 Order data:", orderData);
    console.log("📧 Status change:", oldStatus, "->", newStatus);

    // Tạo HTML cho danh sách sản phẩm
    const productsHtml =
      orderData.items
        ?.map(
          (item) => `
      <tr>
        <td class="image-cell">
          <img src="${
            item.img_url || "https://via.placeholder.com/80x80?text=No+Image"
          }" alt="${item.name}" class="product-img">
        </td>
        <td class="name-cell">
          <div class="product-name">${item.name}</div>
        </td>
        <td class="quantity-cell">
          <span class="quantity">${item.quantity}</span>
        </td>
        <td class="price-cell">
          <div class="product-price">${item.price?.toLocaleString(
            "vi-VN"
          )} VNĐ</div>
        </td>
        <td class="price-cell">
          <div class="product-total">${(
            item.price * item.quantity
          )?.toLocaleString("vi-VN")} VNĐ</div>
        </td>
      </tr>
    `
        )
        .join("") || "";

    const getStatusText = (status) => {
      const statusMap = {
        pending: "Chờ xử lý",
        shipping: "Đang giao hàng",
        completed: "Đã giao hàng",
        canceled: "Đã hủy",
        confirmed: "Đã xác nhận",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        paid: "Đã thanh toán",
        processing: "Đang xử lý",
      };
      return statusMap[status] || status;
    };

    const templateParams = {
      to_email: orderData.customer.email,
      to_name: orderData.customer.name,
      order_id: orderData._id,
      order_date: new Date(orderData.created_at).toLocaleString("vi-VN"),
      total_amount: orderData.total.toLocaleString("vi-VN"),
      customer_address: orderData.customer.address,
      customer_phone: orderData.customer.phone,
      payment_method:
        orderData.payment_method === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Chuyển khoản ngân hàng",
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
      products_count: orderData.items?.length || 0,
    };

    console.log("📧 Template params:", templateParams);

    const response = await axios.post(
      `https://api.emailjs.com/api/v1.0/email/send`,
      {
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: templateParams,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Status update email sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "❌ Status update email error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// Gửi email thông báo đơn hàng mới cho admin
const sendOrderNotificationToAdmin = async (orderData) => {
  try {
    console.log("📧 Starting admin notification email...");
    console.log("📧 Order data for admin:", orderData);

    // Tạo HTML cho danh sách sản phẩm
    const productsHtml =
      orderData.items
        ?.map(
          (item) => `
      <tr>
        <td class="image-cell">
          <img src="${
            item.img_url || "https://via.placeholder.com/80x80?text=No+Image"
          }" alt="${item.name}" class="product-img">
        </td>
        <td class="name-cell">
          <div class="product-name">${item.name}</div>
        </td>
        <td class="quantity-cell">
          <span class="quantity">${item.quantity}</span>
        </td>
        <td class="price-cell">
          <div class="product-price">${item.price?.toLocaleString(
            "vi-VN"
          )} VNĐ</div>
        </td>
        <td class="price-cell">
          <div class="product-total">${(
            item.price * item.quantity
          )?.toLocaleString("vi-VN")} VNĐ</div>
        </td>
      </tr>
    `
        )
        .join("") || "";

    // Đọc template HTML
    const fs = require('fs');
    const path = require('path');
    let templateHtml = '';
    
    try {
      templateHtml = fs.readFileSync(
        path.join(__dirname, 'adminOrderNotificationTemplate.html'), 
        'utf8'
      );
    } catch (templateError) {
      console.error('❌ Error reading template:', templateError);
      // Fallback template đơn giản
      templateHtml = `
        <h1>🛒 Đơn hàng mới #${orderData._id}</h1>
        <p>Khách hàng: ${orderData.customer.name}</p>
        <p>Số điện thoại: ${orderData.customer.phone}</p>
        <p>Tổng tiền: ${orderData.total.toLocaleString("vi-VN")} ₫</p>
        <p>Ngày đặt: ${new Date(orderData.created_at).toLocaleString("vi-VN")}</p>
      `;
    }

    // Thay thế các biến trong template
    const emailHtml = templateHtml
      .replace(/{{order_id}}/g, orderData._id)
      .replace(/{{order_date}}/g, new Date(orderData.created_at).toLocaleString("vi-VN"))
      .replace(/{{total_amount}}/g, orderData.total.toLocaleString("vi-VN"))
      .replace(/{{customer_name}}/g, orderData.customer.name)
      .replace(/{{customer_phone}}/g, orderData.customer.phone)
      .replace(/{{customer_email}}/g, orderData.customer.email || "Không có email")
      .replace(/{{customer_address}}/g, orderData.customer.address)
      .replace(/{{payment_method}}/g, orderData.payment_method === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng")
      .replace(/{{products_html}}/g, productsHtml)
      .replace(/{{products_count}}/g, orderData.items?.length || 0)
      .replace(/{{admin_dashboard_url}}/g, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${orderData._id}`)
      .replace(/{{admin_orders_url}}/g, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders`);

    const templateParams = {
      to_email: "sanghtps39612@gmail.com", // Email admin mặc định
      to_name: "Admin",
      order_id: orderData._id,
      order_date: new Date(orderData.created_at).toLocaleString("vi-VN"),
      total_amount: orderData.total.toLocaleString("vi-VN"),
      customer_name: orderData.customer.name,
      customer_phone: orderData.customer.phone,
      customer_email: orderData.customer.email || "Không có email",
      customer_address: orderData.customer.address,
      payment_method:
        orderData.payment_method === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Chuyển khoản ngân hàng",
      // Thêm danh sách sản phẩm
      products_html: productsHtml,
      products_count: orderData.items?.length || 0,
      // Thông tin admin
      admin_email: "sanghtps39612@gmail.com",
      admin_name: "Admin",
      // HTML content
      message: emailHtml
    };

    console.log("📧 Admin notification template params:", templateParams);

    // Sử dụng EmailJS REST API với template hiện tại
    const response = await axios.post(
      `https://api.emailjs.com/api/v1.0/email/send`,
      {
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID, // Sử dụng template hiện tại
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: templateParams,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Admin notification email sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "❌ Admin notification email error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

const getStatusMessage = (status) => {
  const messageMap = {
    pending:
      "Đơn hàng của bạn đang chờ xử lý. Chúng tôi sẽ thông báo khi có cập nhật.",
    shipping: "Đơn hàng của bạn đang được giao. Vui lòng chuẩn bị nhận hàng.",
    completed:
      "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!",
    canceled:
      "Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.",
    confirmed:
      "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao hàng.",
    delivered:
      "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!",
    cancelled:
      "Đơn hàng của bạn đã được hủy. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.",
    paid: "Đơn hàng của bạn đã được thanh toán thành công.",
    processing: "Đơn hàng của bạn đang được xử lý thanh toán.",
  };
  return messageMap[status] || "Trạng thái đơn hàng đã được cập nhật.";
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderNotificationToAdmin,
};
