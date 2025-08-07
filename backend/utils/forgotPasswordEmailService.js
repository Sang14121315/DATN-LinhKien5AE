const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Cấu hình email service cho forgot password
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "ngtien.2610@gmail.com",
      pass: "chhz oftf ymsd vlxp", // Mật khẩu ứng dụng Google
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Tạo OTP 6 số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Tạo token reset password với OTP
const createResetToken = (userId, otp) => {
  return jwt.sign({ id: userId, otp: otp }, process.env.JWT_SECRET, {
    expiresIn: "5m", // 5 phút
  });
};

// Template email OTP
const createOTPEmailTemplate = (userName, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mã xác thực đặt lại mật khẩu</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .title {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .otp-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          color: white;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .link {
          color: #007bff;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🖥️ 5AELINHKIEN</div>
          <h1 class="title">Mã xác thực đặt lại mật khẩu</h1>
        </div>
        
        <div class="content">
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại 5AELINHKIEN.</p>
          
          <p>Vui lòng sử dụng mã xác thực bên dưới để đặt lại mật khẩu:</p>
          
          <div class="otp-container">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Mã xác thực của bạn:</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Mã này sẽ hết hạn sau 5 phút</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Lưu ý quan trọng:</strong>
            <ul>
              <li>Mã này chỉ có hiệu lực trong 5 phút</li>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
              <li>Để bảo mật, vui lòng không chia sẻ mã này với người khác</li>
              <li>Mã chỉ có thể sử dụng một lần</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Trân trọng,<br>
          <strong>Đội ngũ 5aelinhkien</strong></p>
          
          <p>📧 Email: support@5aelinhkien.com<br>
          📞 Hotline: 0123456789<br>
          🌐 Website: <a href="${
            process.env.FRONTEND_URL || "http://localhost:5173"
          }" class="link">${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }</a></p>
          
          <p style="font-size: 12px; color: #999;">
            Email này được gửi tự động, vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template email reset password thành công
const createResetSuccessEmailTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu thành công</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
          margin-bottom: 10px;
        }
        .title {
          color: #333;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .success-icon {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .login-button {
          display: inline-block;
          background-color: #28a745;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .login-button:hover {
          background-color: #218838;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .link {
          color: #007bff;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🖥️ 5AELINHKIEN</div>
          <h1 class="title">Đặt lại mật khẩu thành công</h1>
        </div>
        
        <div class="content" style="text-align: center;">
          <div class="success-icon">✅</div>
          <p>Xin chào <strong>${userName}</strong>,</p>
          
          <p>Mật khẩu của bạn đã được đặt lại thành công!</p>
          
          <p>Bây giờ bạn có thể đăng nhập vào tài khoản của mình với mật khẩu mới.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/login" class="login-button">
              🔑 Đăng nhập ngay
            </a>
          </div>
          
          <p style="margin-top: 20px;">
            <strong>Lưu ý bảo mật:</strong>
          </p>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>Không chia sẻ mật khẩu với người khác</li>
            <li>Sử dụng mật khẩu mạnh với ký tự đặc biệt</li>
            <li>Đăng xuất khi sử dụng thiết bị công cộng</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Trân trọng,<br>
          <strong>Đội ngũ 5AELINHKIEN</strong></p>
          
          <p>📧 Email: support@5aelinhkien.com<br>
          📞 Hotline: 0123456789<br>
          🌐 Website: <a href="${process.env.FRONTEND_URL}" class="link">${process.env.FRONTEND_URL}</a></p>
          
          <p style="font-size: 12px; color: #999;">
            Email này được gửi tự động, vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Gửi email OTP
const sendOTPEmail = async (user) => {
  try {
    console.log("🔧 Creating email transporter...");
    const transporter = createTransporter();

    console.log("🔧 Generating OTP...");
    const otp = generateOTP();
    const resetToken = createResetToken(user._id, otp);

    console.log("🔧 Sending OTP email to:", user.email);
    console.log("🔧 OTP:", otp);

    const mailOptions = {
      from: '"5AELINHKIEN" <ngtien.2610@gmail.com>',
      to: user.email,
      subject: "🔐 Mã xác thực đặt lại mật khẩu - 5AELINHKIEN",
      html: createOTPEmailTemplate(user.name, otp),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      resetToken: resetToken,
      otp: otp, // Chỉ trả về trong development
    };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
  }
};

// Gửi email thông báo reset password thành công
const sendResetSuccessEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"5AELINHKIEN" <ngtien.2610@gmail.com>',
      to: user.email,
      subject: "✅ Đặt lại mật khẩu thành công - 5AELINHKIEN",
      html: createResetSuccessEmailTemplate(user.name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reset success email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending reset success email:", error);
    // Không throw error vì đây chỉ là email thông báo
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify reset token với OTP
const verifyResetToken = (token, otp) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra OTP có khớp không
    if (decoded.otp !== otp) {
      throw new Error("Mã OTP không đúng");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
    }
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }
};

module.exports = {
  sendOTPEmail,
  sendResetSuccessEmail,
  verifyResetToken,
  createResetToken,
  generateOTP,
};
