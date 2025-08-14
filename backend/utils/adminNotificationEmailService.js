const nodemailer = require("nodemailer");
const { emailConfig } = require("../config/emailConfig");

// Cấu hình email service cho admin notification
const createTransporter = () => {
  return nodemailer.createTransport({
    ...emailConfig.smtp,
    connectionTimeout: emailConfig.timeout.connection,
    greetingTimeout: emailConfig.timeout.connection,
    socketTimeout: emailConfig.timeout.send,
  });
};

// Template email thông báo cho admin
const createAdminNotificationEmailTemplate = (contactData) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thông báo liên hệ mới - 5AELINHKIEN</title>
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
          color: #dc3545;
          margin-bottom: 10px;
        }
        .title {
          color: #dc3545;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .alert-badge {
          background-color: #dc3545;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .contact-info {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .contact-info h3 {
          color: #495057;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 8px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          align-items: center;
        }
        .info-label {
          font-weight: bold;
          color: #495057;
          min-width: 120px;
          margin-right: 15px;
        }
        .info-value {
          color: #212529;
          flex: 1;
        }
        .message-content {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .message-content h3 {
          color: #856404;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
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
        .urgent-note {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #721c24;
        }
        .timestamp {
          background-color: #e2e3e5;
          border: 1px solid #d6d8db;
          border-radius: 5px;
          padding: 10px;
          margin: 15px 0;
          text-align: center;
          font-size: 14px;
          color: #495057;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">🖥️ 5AELINHKIEN</div>
          <h1 class="title">📬 Thông báo liên hệ mới</h1>
          <div class="alert-badge">⚠️ CẦN XỬ LÝ NGAY</div>
        </div>
        
        <div class="content">
          <p>Xin chào <strong>Admin</strong>,</p>
          
          <p>Bạn có một tin nhắn liên hệ mới từ khách hàng cần xử lý ngay!</p>
          
          <div class="timestamp">
            <strong>⏰ Thời gian gửi:</strong> ${new Date().toLocaleString(
              "vi-VN",
              {
                timeZone: "Asia/Ho_Chi_Minh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            )}
          </div>
          
          <div class="contact-info">
            <h3>👤 Thông tin khách hàng</h3>
            <div class="info-row">
              <span class="info-label">Tên:</span>
              <span class="info-value">${contactData.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${contactData.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số điện thoại:</span>
              <span class="info-value">${contactData.phone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tiêu đề:</span>
              <span class="info-value"><strong>${
                contactData.title
              }</strong></span>
            </div>
          </div>
          
          <div class="message-content">
            <h3>💬 Nội dung tin nhắn</h3>
            <p style="white-space: pre-wrap; margin: 0;">${
              contactData.message
            }</p>
          </div>
          
          <div class="urgent-note">
            <strong>🚨 Lưu ý:</strong> Vui lòng phản hồi khách hàng trong thời gian sớm nhất để đảm bảo chất lượng dịch vụ!
          </div>
          
          <div style="text-align: center;">
                         <a href="${
                           emailConfig.urls.admin
                         }/contacts" class="button">
              🔍 Xem chi tiết & Phản hồi
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>Trân trọng,<br>
          <strong>Hệ thống 5AELINHKIEN</strong></p>
          
          <p>📧 Email: admin@5aelinhkien.com<br>
          📞 Hotline: 0123456789<br>
                     🌐 Website: <a href="${
                       emailConfig.urls.frontend
                     }" style="color: #007bff;">${
    emailConfig.urls.frontend
  }</a></p>
          
          <p style="font-size: 12px; color: #999;">
            Email này được gửi tự động từ hệ thống, vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Gửi email thông báo cho admin với retry mechanism
const sendAdminNotificationEmail = async (
  contactData,
  adminEmail,
  retryCount = 0
) => {
  const maxRetries = emailConfig.retry.maxAttempts;

  try {
    console.log(
      `🔧 Creating email transporter for admin notification... (attempt ${
        retryCount + 1
      })`
    );
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    console.log("🔧 Sending admin notification email to:", adminEmail);
    console.log("🔧 Contact data:", {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      title: contactData.title,
      message: contactData.message,
    });

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to: adminEmail,
      subject: `🚨 LIÊN HỆ MỚI: ${contactData.title} - ${contactData.name}`,
      html: createAdminNotificationEmailTemplate(contactData),
      priority: "high",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      "✅ Admin notification email sent successfully:",
      info.messageId
    );

    // Close transporter after use
    transporter.close();

    return {
      success: true,
      messageId: info.messageId,
      attempt: retryCount + 1,
    };
  } catch (error) {
    console.error(
      `❌ Error sending admin notification email (attempt ${retryCount + 1}):`,
      error.message
    );

    // Retry logic
    if (retryCount < maxRetries && isRetryableError(error)) {
      console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise((resolve) =>
        setTimeout(resolve, emailConfig.retry.delayMs * (retryCount + 1))
      ); // Exponential backoff
      return sendAdminNotificationEmail(
        contactData,
        adminEmail,
        retryCount + 1
      );
    }

    // Log detailed error for debugging
    console.error("❌ Final error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });

    throw new Error(
      `Không thể gửi email thông báo cho admin sau ${
        retryCount + 1
      } lần thử. Lỗi: ${error.message}`
    );
  }
};

// Kiểm tra lỗi có thể retry được không
const isRetryableError = (error) => {
  const retryableCodes = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
  ];
  const retryableMessages = ["timeout", "connection", "network", "temporary"];

  return (
    retryableCodes.includes(error.code) ||
    retryableMessages.some((msg) => error.message.toLowerCase().includes(msg))
  );
};

// Gửi email thông báo cho tất cả admin với parallel processing
const sendAdminNotificationToAllAdmins = async (contactData, adminEmails) => {
  try {
    console.log("🔧 Sending admin notification emails to all admins...");
    console.log(`📧 Total admin emails: ${adminEmails.length}`);

    if (!adminEmails || adminEmails.length === 0) {
      console.log("⚠️ No admin emails provided");
      return {
        success: false,
        totalSent: 0,
        totalAdmins: 0,
        results: [],
        message: "No admin emails provided",
      };
    }

    // Gửi email song song để tăng tốc độ
    const emailPromises = adminEmails.map(async (adminEmail) => {
      try {
        const result = await sendAdminNotificationEmail(
          contactData,
          adminEmail
        );
        return { email: adminEmail, success: true, result };
      } catch (error) {
        console.error(
          `❌ Failed to send email to ${adminEmail}:`,
          error.message
        );
        return {
          email: adminEmail,
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.allSettled(emailPromises);

    // Xử lý kết quả
    const processedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          email: "unknown",
          success: false,
          error: result.reason?.message || "Unknown error",
        };
      }
    });

    const successCount = processedResults.filter((r) => r.success).length;
    const totalCount = adminEmails.length;

    console.log(
      `✅ Admin notification emails sent: ${successCount}/${totalCount}`
    );

    // Log chi tiết kết quả
    processedResults.forEach((result) => {
      if (result.success) {
        console.log(
          `✅ Email sent to ${result.email}: ${result.result.messageId}`
        );
      } else {
        console.log(`❌ Email failed to ${result.email}: ${result.error}`);
      }
    });

    return {
      success: successCount > 0,
      totalSent: successCount,
      totalAdmins: totalCount,
      results: processedResults,
      summary: {
        successRate: `${((successCount / totalCount) * 100).toFixed(1)}%`,
        failedCount: totalCount - successCount,
      },
    };
  } catch (error) {
    console.error(
      "❌ Critical error in sendAdminNotificationToAllAdmins:",
      error
    );
    throw new Error(
      `Lỗi nghiêm trọng khi gửi email thông báo: ${error.message}`
    );
  }
};

module.exports = {
  sendAdminNotificationEmail,
  sendAdminNotificationToAllAdmins,
};
