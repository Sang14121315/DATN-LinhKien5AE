const {
  sendAdminNotificationEmail,
  sendAdminNotificationToAllAdmins,
} = require("../utils/adminNotificationEmailService");

// Dữ liệu test
const testContactData = {
  name: "Nguyễn Văn Test",
  email: "test@example.com",
  phone: "0123456789",
  title: "Hỏi về sản phẩm laptop gaming",
  message:
    "Chào bạn, tôi muốn hỏi về sản phẩm laptop gaming của các bạn. Có thể cho tôi biết thêm thông tin về cấu hình và giá cả không? Cảm ơn bạn nhiều!",
};

const testAdminEmails = [
  "ngtien.2610@gmail.com", // Email chính
  // "admin2@example.com", // Email test khác nếu có
];

// Test gửi email cho 1 admin
const testSingleAdminEmail = async () => {
  try {
    console.log("🧪 Testing single admin notification email...");
    console.log("📧 Sending to:", testAdminEmails[0]);
    console.log("📝 Contact data:", testContactData);

    const startTime = Date.now();
    const result = await sendAdminNotificationEmail(
      testContactData,
      testAdminEmails[0]
    );
    const endTime = Date.now();

    console.log("✅ Single admin email test successful!");
    console.log("📨 Result:", result);
    console.log(`⏱️ Time taken: ${endTime - startTime}ms`);
  } catch (error) {
    console.error("❌ Single admin email test failed:", error.message);
    if (error.stack) {
      console.error("📚 Stack trace:", error.stack);
    }
  }
};

// Test gửi email cho nhiều admin
const testMultipleAdminEmails = async () => {
  try {
    console.log("\n🧪 Testing multiple admin notification emails...");
    console.log("📧 Sending to:", testAdminEmails);
    console.log("📝 Contact data:", testContactData);

    const startTime = Date.now();
    const result = await sendAdminNotificationToAllAdmins(
      testContactData,
      testAdminEmails
    );
    const endTime = Date.now();

    console.log("✅ Multiple admin emails test successful!");
    console.log("📨 Result:", result);
    console.log(`⏱️ Time taken: ${endTime - startTime}ms`);

    // Hiển thị thống kê chi tiết
    if (result.summary) {
      console.log("📊 Summary:", result.summary);
    }
  } catch (error) {
    console.error("❌ Multiple admin emails test failed:", error.message);
    if (error.stack) {
      console.error("📚 Stack trace:", error.stack);
    }
  }
};

// Test connection SMTP
const testSMTPConnection = async () => {
  try {
    console.log("\n🔧 Testing SMTP connection...");
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ngtien.2610@gmail.com",
        pass: "chhz oftf ymsd vlxp",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP connection test successful!");
    transporter.close();
  } catch (error) {
    console.error("❌ SMTP connection test failed:", error.message);
    console.error("📚 Stack trace:", error.stack);
  }
};

// Chạy test
const runTests = async () => {
  console.log("🚀 Starting admin notification email tests...\n");
  console.log("📧 Test emails:", testAdminEmails);
  console.log("📝 Test contact data:", testContactData);
  console.log("=".repeat(60));

  await testSMTPConnection();
  await testSingleAdminEmail();
  await testMultipleAdminEmails();

  console.log("\n🏁 All tests completed!");
  console.log("=".repeat(60));
};

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testSingleAdminEmail,
  testMultipleAdminEmails,
  testSMTPConnection,
  runTests,
};
