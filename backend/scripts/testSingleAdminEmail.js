const {
  sendAdminNotificationEmail,
} = require("../utils/adminNotificationEmailService");

// Test data
const testContactData = {
  name: "Nguyễn Văn Test",
  email: "test@example.com",
  phone: "0123456789",
  title: "Test Contact Email - Admin cụ thể",
  message:
    "Đây là tin nhắn test để kiểm tra email service gửi cho admin ngtien.2610@gmail.com",
};

// Admin email cụ thể
const targetAdminEmail = "ngtien.2610@gmail.com";

// Test gửi email cho admin cụ thể
const testSingleAdminEmail = async () => {
  try {
    console.log("🧪 Testing single admin notification email...");
    console.log("📧 Target admin email:", targetAdminEmail);
    console.log("📝 Contact data:", testContactData);
    console.log("=".repeat(60));

    const startTime = Date.now();
    const result = await sendAdminNotificationEmail(
      testContactData,
      targetAdminEmail
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

// Chạy test
const runTest = async () => {
  console.log("🚀 Starting single admin email test...\n");

  await testSingleAdminEmail();

  console.log("\n🏁 Test completed!");
  console.log("=".repeat(60));
};

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = {
  testSingleAdminEmail,
  runTest,
};
