const nodemailer = require("nodemailer");

// Cấu hình email service cho contact reply
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

// Template email phản hồi liên hệ
const createContactReplyEmailTemplate = (contactData, adminReply) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Phản hồi từ 5AELINHKIEN</title>
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
        .original-message {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .reply-message {
          background-color: #e8f5e8;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .contact-info {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
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
        .button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🖥️ 5AELINHKIEN</div>
          <h1 class="title">Phản hồi từ 5AELINHKIEN</h1>
        </div>
        
        <div class="content">
          <p>Xin chào <strong>${contactData.name}</strong>,</p>
          
          <p>Cảm ơn bạn đã liên hệ với chúng tôi. Dưới đây là phản hồi của chúng tôi:</p>
          
          <div class="contact-info">
            <strong>📧 Thông tin liên hệ của bạn:</strong><br>
            <strong>Tên:</strong> ${contactData.name}<br>
            <strong>Email:</strong> ${contactData.email}<br>
            <strong>Số điện thoại:</strong> ${contactData.phone}<br>
            <strong>Tiêu đề:</strong> ${contactData.title}
          </div>
          
          <div class="original-message">
            <strong>📝 Tin nhắn của bạn:</strong><br>
            ${contactData.message}
          </div>
          
          <div class="reply-message">
            <strong>💬 Phản hồi từ chúng tôi:</strong><br>
            ${adminReply}
          </div>
          
          <p>Nếu bạn có thêm câu hỏi hoặc cần hỗ trợ thêm, vui lòng không ngần ngại liên hệ lại với chúng tôi.</p>
          
          <div style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/contact" class="button">
              📞 Liên hệ lại
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Trân trọng,<br>
          <strong>Đội ngũ 5AELINHKIEN</strong></p>
          
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

// Gửi email phản hồi liên hệ
const sendContactReplyEmail = async (contactData, adminReply) => {
  try {
    console.log("🔧 Creating email transporter for contact reply...");
    const transporter = createTransporter();

    console.log("🔧 Sending contact reply email to:", contactData.email);
    console.log("🔧 Contact data:", {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      title: contactData.title,
      message: contactData.message,
    });
    console.log("🔧 Admin reply:", adminReply);

    const mailOptions = {
      from: '"5AELINHKIEN Support" <ngtien.2610@gmail.com>',
      to: contactData.email,
      subject: `💬 Phản hồi từ 5AELINHKIEN - ${contactData.title}`,
      html: createContactReplyEmailTemplate(contactData, adminReply),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Contact reply email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending contact reply email:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw new Error("Không thể gửi email phản hồi. Vui lòng thử lại sau.");
  }
};

module.exports = {
  sendContactReplyEmail,
};
