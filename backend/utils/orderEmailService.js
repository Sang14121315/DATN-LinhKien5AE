const nodemailer = require("nodemailer");
const { emailConfig } = require("../config/emailConfig");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_ADMIN || "";
const BRAND_COLOR = process.env.BRAND_COLOR || "#2563eb";
const LOGO_URL = process.env.BRAND_LOGO_URL || ""; // ví dụ: https://yourcdn/logo.png

const createTransporter = () => {
  return nodemailer.createTransport({
    ...emailConfig.smtp,
    connectionTimeout: emailConfig.timeout.connection,
    greetingTimeout: emailConfig.timeout.connection,
    socketTimeout: emailConfig.timeout.send,
  });
};

const formatVnd = (n) => {
  try {
    return Number(n || 0).toLocaleString("vi-VN");
  } catch (_) {
    return `${n}`;
  }
};

const buildProductsHtml = (items = []) => {
  const rows =
    items
      ?.map(
        (item) => `
      <tr>
        <td style="padding:10px;border:1px solid #eee;width:72px;">
          <img src="${
            item.img_url || "https://via.placeholder.com/64?text=No+Image"
          }" alt="${item.name}" width="64" height="64" style="display:block;border-radius:6px;object-fit:cover;max-width:64px;max-height:64px;">
        </td>
        <td style="padding:10px;border:1px solid #eee;">
          <div style="font-size:14px;color:#111;line-height:1.4;">${item.name}</div>
        </td>
        <td align="center" style="padding:10px;border:1px solid #eee;white-space:nowrap;">
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#eef2ff;color:#1e3a8a;font-size:12px;">${item.quantity}</span>
        </td>
        <td align="right" style="padding:10px;border:1px solid #eee;white-space:nowrap;">
          <div style="font-size:14px;color:#111;">${formatVnd(item.price)} VNĐ</div>
        </td>
        <td align="right" style="padding:10px;border:1px solid #eee;white-space:nowrap;">
          <div style="font-weight:600;color:#111;">${formatVnd(
            (item.price || 0) * (item.quantity || 0)
          )} VNĐ</div>
        </td>
      </tr>
    `
      )
      .join("") || "";

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid #eee;">
      <thead>
        <tr>
          <th align="left" style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:12px;color:#555;width:72px;">Ảnh</th>
          <th align="left" style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:12px;color:#555;">Sản phẩm</th>
          <th align="center" style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:12px;color:#555;white-space:nowrap;">SL</th>
          <th align="right" style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:12px;color:#555;white-space:nowrap;">Đơn giá</th>
          <th align="right" style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:12px;color:#555;white-space:nowrap;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

const buildTotalsHtml = (orderData) => {
  const subtotal = (orderData.items || []).reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );
  const shippingFee = Number(orderData.shipping_fee || 0);
  const discount = Number(orderData.discount || orderData.coupon_discount || 0);
  const total = Number(orderData.total || subtotal + shippingFee - discount);

  const lines = [
    { label: "Tạm tính", value: subtotal },
  ];
  if (shippingFee > 0) lines.push({ label: "Phí vận chuyển", value: shippingFee });
  if (discount > 0) lines.push({ label: "Giảm giá", value: -discount });
  lines.push({ label: "Tổng cộng", value: total, bold: true });

  const rows = lines
    .map(
      (l) => `
      <tr>
        <td style="padding:6px 0;color:#555;">${l.label}</td>
        <td align="right" style="padding:6px 0;${l.bold ? "font-weight:700;color:#111;" : ""}">${
          (l.value < 0 ? "- " : "") + formatVnd(Math.abs(l.value))
        } VNĐ</td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      ${rows}
    </table>
  `;
};

// Fancy sections similar to the reference screenshot
const renderSectionCard = (icon, title, innerHtml) => {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:12px 0;border:1px solid #e9eef5;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:12px 14px;background:#f8fafc;border-bottom:1px solid #eef2f7;font-weight:700;color:#0f172a;font-size:14px;">
          <span style="margin-right:8px">${icon}</span>${title}
        </td>
      </tr>
      <tr>
        <td style="padding:14px;background:#ffffff;">
          ${innerHtml}
        </td>
      </tr>
    </table>
  `;
};

const buildProductsPlainList = (items = []) => {
  const lines = items.map((it, idx) => `${idx + 1}. ${it.name}\nSố lượng: ${it.quantity}  x  ${formatVnd(it.price)} VND\nThành tiền: ${formatVnd((it.price||0)*(it.quantity||0))} VND`).join("\n\n");
  return `
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;color:#0f172a;background:#f8fafc;border:1px solid #eef2f7;border-radius:10px;padding:12px;white-space:pre-wrap;line-height:1.6;">
      ${lines || 'Không có sản phẩm'}
    </div>
  `;
};

const wrapEmail = (title, contentHtml, cta) => {
  const logo = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="Logo" height="32" style="display:block;max-height:32px;">`
    : `<span style="font-size:16px;font-weight:700;color:#ffffff;">${emailConfig.from.name}</span>`;

  const ctaHtml = cta && cta.href && cta.label
    ? `<tr>
          <td align="center" style="padding:8px 24px 0 24px;">
            <a href="${cta.href}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600;font-size:14px;">${cta.label}</a>
          </td>
        </tr>`
    : "";

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f6f9fc;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff;border:1px solid #eaeaea;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#333;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:14px 20px;background:${BRAND_COLOR};">
              ${logo}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;border-bottom:1px solid #f0f0f0;background:#fafafa;">
              <h2 style="margin:0;font-size:18px;color:#111;">${title}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;font-size:14px;line-height:1.6;">
              ${contentHtml}
            </td>
          </tr>
          ${ctaHtml}
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #f0f0f0;font-size:12px;color:#777;background:#fafafa;">
              <div style="margin:0;">${emailConfig.from.name}</div>
              <div style="margin:0;">Đây là email tự động, vui lòng không trả lời.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

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

// Email xác nhận đơn hàng cho khách, BCC admin nếu có
const sendOrderConfirmationEmail = async (orderData) => {
  const transporter = createTransporter();
  const toEmail = orderData?.customer?.email;
  if (!toEmail) {
    console.warn("⚠️ Không có email khách hàng để gửi xác nhận đơn hàng");
    return { success: false, error: "Missing customer email" };
  }

  const productsHtml = buildProductsHtml(orderData.items);

  const infoTable = `
    <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">
      <tr><td style=\"padding:6px 0;\">Mã đơn hàng:</td><td align=\"right\" style=\"padding:6px 0;\">#${orderData._id}</td></tr>
      <tr><td style=\"padding:6px 0;\">Ngày đặt:</td><td align=\"right\" style=\"padding:6px 0;\">${new Date(orderData.created_at).toLocaleString("vi-VN")}</td></tr>
      <tr><td style=\"padding:6px 0;\">Phương thức thanh toán:</td><td align=\"right\" style=\"padding:6px 0;\">${orderData.payment_method === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng"}</td></tr>
      <tr><td style=\"padding:6px 0;\">Trạng thái:</td><td align=\"right\" style=\"padding:6px 0;\">${getStatusText(orderData.status || "pending")}</td></tr>
      <tr><td style=\"padding:6px 0;\">Số lượng sản phẩm:</td><td align=\"right\" style=\"padding:6px 0;\">${(orderData.items||[]).length} sản phẩm</td></tr>
    </table>`;

  const htmlInner = `
    <p style=\"margin:0 0 10px;\">Xin chào <strong>${orderData.customer.name}</strong>,</p>
    <p style=\"margin:0 0 16px;\">Cảm ơn bạn đã đặt hàng tại <strong>${emailConfig.from.name}</strong>. Chúng tôi đã nhận được đơn hàng của bạn và <strong>Đã xác nhận</strong>.</p>
    ${renderSectionCard('📋', 'Thông tin đơn hàng:', infoTable)}
    ${renderSectionCard('📦', 'Danh sách sản phẩm:', buildProductsPlainList(orderData.items))}
    ${renderSectionCard('📍', 'Địa chỉ giao hàng:', `
      <div><strong>Người nhận:</strong> ${orderData.customer.name}</div>
      <div><strong>Số điện thoại:</strong> ${orderData.customer.phone}</div>
      <div><strong>Email:</strong> ${orderData.customer.email || 'Không có'}</div>
      <div><strong>Địa chỉ:</strong> ${orderData.customer.address}</div>
    `)}
    ${renderSectionCard('💰', 'Tổng tiền:', `
      <div style=\"font-weight:700;color:#16a34a;font-size:16px;\">${formatVnd(orderData.total)} VND</div>
    `)}
  `;
  const html = wrapEmail(
    `🛒 Xác nhận đơn hàng #${orderData._id}`,
    htmlInner,
    {
      href:
        (process.env.FRONTEND_URL || "http://localhost:5173") +
        "/orders/" +
        orderData._id,
      label: "Xem chi tiết đơn hàng",
    }
  );

  const mailOptions = {
    from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
    to: toEmail,
    bcc: ADMIN_EMAIL || undefined,
    subject: `Xác nhận đơn hàng #${orderData._id}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đã gửi:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Lỗi gửi email xác nhận:", error.message);
    return { success: false, error: error.message };
  }
};

// Email cập nhật trạng thái cho khách, BCC admin nếu có
const sendOrderStatusUpdateEmail = async (orderData, oldStatus, newStatus) => {
  const transporter = createTransporter();
  const toEmail = orderData?.customer?.email;
  if (!toEmail) {
    console.warn("⚠️ Không có email khách hàng để gửi cập nhật trạng thái");
    return { success: false, error: "Missing customer email" };
  }

  const productsHtml = buildProductsHtml(orderData.items);

  const htmlInner = `
    <p style="margin:0 0 10px;">Xin chào <strong>${orderData.customer.name}</strong>,</p>
    <p style="margin:0 0 12px;">Trạng thái đơn hàng đã thay đổi: <strong>${getStatusText(
      oldStatus
    )}</strong> ➜ <strong>${getStatusText(newStatus)}</strong></p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 12px;">
      <tr>
        <td style="padding:6px 0;">Mã đơn hàng:</td>
        <td align="right" style="padding:6px 0;">#${orderData._id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Ngày đặt:</td>
        <td align="right" style="padding:6px 0;">${new Date(orderData.created_at).toLocaleString("vi-VN")}</td>
      </tr>
    </table>
    <h3 style="margin:16px 0 8px;font-size:16px;color:#111;">Sản phẩm</h3>
    ${productsHtml}
    <h3 style="margin:16px 0 8px;font-size:16px;color:#111;">Tổng kết</h3>
    ${buildTotalsHtml(orderData)}
  `;
  const html = wrapEmail(
    `🔔 Cập nhật đơn hàng #${orderData._id}`,
    htmlInner,
    {
      href:
        (process.env.FRONTEND_URL || "http://localhost:5173") +
        "/orders/" +
        orderData._id,
      label: "Xem đơn hàng",
    }
  );

  const mailOptions = {
    from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
    to: toEmail,
    bcc: ADMIN_EMAIL || undefined,
    subject: `Cập nhật đơn hàng #${orderData._id}: ${getStatusText(
      newStatus
    )}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email cập nhật trạng thái đã gửi:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Lỗi gửi email cập nhật trạng thái:", error.message);
    return { success: false, error: error.message };
  }
};

// Email thông báo đơn hàng mới cho admin
const sendOrderNotificationToAdmin = async (orderData) => {
  const transporter = createTransporter();
  const adminEmail = ADMIN_EMAIL || emailConfig.from.email;
  if (!adminEmail) {
    console.warn("⚠️ Không có email admin để gửi thông báo");
    return { success: false, error: "Missing admin email" };
  }

  const productsHtml = buildProductsHtml(orderData.items);

  const htmlInner = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 12px;">
      <tr>
        <td style="padding:6px 0;">Mã đơn hàng:</td>
        <td align="right" style="padding:6px 0;">#${orderData._id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Ngày đặt:</td>
        <td align="right" style="padding:6px 0;">${new Date(
          orderData.created_at
        ).toLocaleString("vi-VN")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Khách hàng:</td>
        <td align="right" style="padding:6px 0;">${orderData.customer.name}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Điện thoại:</td>
        <td align="right" style="padding:6px 0;">${orderData.customer.phone}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Email:</td>
        <td align="right" style="padding:6px 0;">${orderData.customer.email || "Không có"}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Địa chỉ:</td>
        <td align="right" style="padding:6px 0;">${orderData.customer.address}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;">Hình thức thanh toán:</td>
        <td align="right" style="padding:6px 0;">${
          orderData.payment_method === "cod"
            ? "Thanh toán khi nhận hàng"
            : "Chuyển khoản ngân hàng"
        }</td>
      </tr>
    </table>
    <h3 style="margin:16px 0 8px;font-size:16px;color:#111;">Sản phẩm</h3>
    ${productsHtml}
    <h3 style="margin:16px 0 8px;font-size:16px;color:#111;">Tổng kết</h3>
    ${buildTotalsHtml(orderData)}
    <p style="margin:16px 0 0;"><a style="color:#2563eb;text-decoration:none;" href="${
      (process.env.FRONTEND_URL || "http://localhost:5173") +
      "/admin/orders/" +
      orderData._id
    }">Mở chi tiết đơn hàng</a></p>
  `;
  const html = wrapEmail(
    `🛒 Đơn hàng mới #${orderData._id}`,
    htmlInner,
    {
      href:
        (process.env.FRONTEND_URL || "http://localhost:5173") +
        "/admin/orders/" +
        orderData._id,
      label: "Mở chi tiết trên Admin",
    }
  );

  const mailOptions = {
    from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
    to: adminEmail,
    subject: `Đơn hàng mới #${orderData._id}`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email thông báo admin đã gửi:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Lỗi gửi email admin:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendOrderNotificationToAdmin,
};


