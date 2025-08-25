const nodemailer = require("nodemailer");
const { emailConfig } = require("../config/emailConfig");

// Khởi tạo transporter theo cấu hình chung
const createTransporter = () => {
  return nodemailer.createTransport({
    ...emailConfig.smtp,
    connectionTimeout: emailConfig.timeout.connection,
    greetingTimeout: emailConfig.timeout.connection,
    socketTimeout: emailConfig.timeout.send,
  });
};

// Template email chào mừng người dùng mới
const createWelcomeEmailTemplate = (user) => {
  const safeName = user?.name || "bạn";
  const safeEmail = user?.email || "Chưa cập nhật";
  const safePhone = user?.phone || "Chưa cập nhật";
  const safeAddress = user?.address || "Chưa cập nhật";
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color:#1a73e8; margin-top:0;">🎉 Chào mừng ${safeName} đến với 5AELINHKIEN!</h2>
      <p>
        Tài khoản của bạn đã được tạo thành công. Cảm ơn bạn đã đăng ký và tin tưởng 5AELINHKIEN.
      </p>
      <p>
        Bây giờ bạn có thể đăng nhập, cập nhật hồ sơ, theo dõi đơn hàng và nhận nhiều ưu đãi hấp dẫn.
      </p>
      <div style="background:#f9fbff; border:1px solid #e6eefc; border-radius:10px; padding:16px; margin:16px 0;">
        <h3 style="margin:0 0 10px; color:#1a73e8; font-size:16px;">Thông tin tài khoản</h3>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:6px 0; color:#555; width:120px;">Họ và tên</td>
            <td style="padding:6px 0; font-weight:600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#555;">Email</td>
            <td style="padding:6px 0; font-weight:600;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#555;">Số điện thoại</td>
            <td style="padding:6px 0; font-weight:600;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#555;">Địa chỉ</td>
            <td style="padding:6px 0; font-weight:600;">${safeAddress}</td>
          </tr>
        </table>
      </div>
      <div style="margin: 16px 0;">
        <a href="${emailConfig.urls.frontend}/login" style="display:inline-block; background:#1a73e8; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Đăng nhập ngay</a>
      </div>
      <p style="font-size: 13px; color:#666;">
        Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email hoặc liên hệ hỗ trợ.
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;"/>
      <p style="font-size: 12px; color:#888;">
        Trân trọng,<br/>
        Đội ngũ 5AELINHKIEN
      </p>
    </div>
  </div>
  `;
};

// Gửi email chào mừng
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    // verify kết nối SMTP (không bắt buộc, nhưng giúp debug tốt hơn)
    try {
      await transporter.verify();
    } catch (_) {}

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to: user.email,
      subject: "🎉 Chào mừng bạn đến với 5AELINHKIEN",
      html: createWelcomeEmailTemplate(user),
      priority: "high",
    };

    const info = await transporter.sendMail(mailOptions);
    transporter.close();
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error?.message || error);
    return { success: false, error: error?.message || "Unknown error" };
  }
};

module.exports = { sendWelcomeEmail };
