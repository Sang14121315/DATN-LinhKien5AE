const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');

  // Kiểm tra biến môi trường
  console.log('📋 Environment Variables:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not set'}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL ? '✅ Set' : '❌ Not set'}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing required email configuration!');
    console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }

  // Tạo transporter
  console.log('🔧 Creating email transporter...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Test kết nối
  try {
    console.log('🔍 Testing connection...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!\n');

    // Test gửi email
    console.log('📧 Testing email sending...');
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: '🧪 Test Email - 5AnhEmPC Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">✅ Email Service Test Successful!</h2>
          <p>Chức năng gửi email đã được cấu hình thành công.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Configuration Details:</h3>
            <p><strong>Email User:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL || 'Not set'}</p>
            <p><strong>Frontend URL:</strong> ${process.env.FRONTEND_URL || 'Not set'}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          <p>🎉 Bây giờ bạn có thể sử dụng chức năng gửi email trong hệ thống!</p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);

    console.log('🎉 Email service is ready to use!');
    console.log('📖 Check README_EMAIL.md for usage instructions');

  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure you have enabled 2-Step Verification on your Gmail account');
      console.log('2. Generate an App Password (not your regular Gmail password)');
      console.log('3. Use the App Password in EMAIL_PASS');
      console.log('4. Check EMAIL_SETUP.md for detailed instructions');
    }
  }
}

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  testEmailConfig().catch(console.error);
}

module.exports = testEmailConfig; 