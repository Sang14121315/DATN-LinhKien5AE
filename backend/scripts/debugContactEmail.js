const UserService = require("../services/userService");
const {
  sendAdminNotificationToAllAdmins,
} = require("../utils/adminNotificationEmailService");
const { emailConfig, testEmailConfig } = require("../config/emailConfig");

// Test data
const testContactData = {
  name: "Nguyễn Văn Test",
  email: "test@example.com",
  phone: "0123456789",
  title: "Test Contact Email",
  message: "Đây là tin nhắn test để kiểm tra email service",
};

// Debug function 1: Kiểm tra cấu hình email
const debugEmailConfig = async () => {
  console.log("🔧 Debug 1: Kiểm tra cấu hình email");
  console.log("=".repeat(50));

  try {
    console.log("📧 Email config:", {
      smtp: {
        host: emailConfig.smtp.host,
        port: emailConfig.smtp.port,
        user: emailConfig.smtp.auth.user,
        pass: emailConfig.smtp.auth.pass ? "***" : "undefined",
      },
      from: emailConfig.from,
      urls: emailConfig.urls,
    });

    // Test SMTP connection
    console.log("\n🔧 Testing SMTP connection...");
    const smtpTest = await testEmailConfig();
    console.log("✅ SMTP test result:", smtpTest);
  } catch (error) {
    console.error("❌ Email config error:", error.message);
  }
};

// Debug function 2: Kiểm tra admin users
const debugAdminUsers = async () => {
  console.log("\n🔧 Debug 2: Kiểm tra admin users");
  console.log("=".repeat(50));

  try {
    console.log("🔍 Searching for admin users...");
    const admins = await UserService.getAll({ role: "admin" });

    console.log(`📊 Found ${admins.length} admin users:`);
    admins.forEach((admin, index) => {
      console.log(
        `  ${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role}`
      );
    });

    if (admins.length === 0) {
      console.log("⚠️ No admin users found!");
      console.log("💡 Solution: Create a user with role='admin'");
    }

    return admins;
  } catch (error) {
    console.error("❌ Admin users error:", error.message);
    return [];
  }
};

// Debug function 3: Test gửi email
const debugSendEmail = async (adminEmails) => {
  console.log("\n🔧 Debug 3: Test gửi email");
  console.log("=".repeat(50));

  if (!adminEmails || adminEmails.length === 0) {
    console.log("⚠️ No admin emails to test with");
    return;
  }

  try {
    console.log("📧 Testing email sending to:", adminEmails);
    console.log("📝 Test contact data:", testContactData);

    const startTime = Date.now();
    const result = await sendAdminNotificationToAllAdmins(
      testContactData,
      adminEmails
    );
    const endTime = Date.now();

    console.log("✅ Email test result:", result);
    console.log(`⏱️ Time taken: ${endTime - startTime}ms`);
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
    console.error("📚 Stack trace:", error.stack);
  }
};

// Main debug function
const runDebug = async () => {
  console.log("🚀 Starting Contact Email Debug...\n");

  try {
    // Debug 1: Email config
    await debugEmailConfig();

    // Debug 2: Admin users
    const admins = await debugAdminUsers();

    // Debug 3: Send email
    if (admins.length > 0) {
      const adminEmails = admins
        .map((admin) => admin.email)
        .filter((email) => email);
      await debugSendEmail(adminEmails);
    }
  } catch (error) {
    console.error("❌ Critical debug error:", error.message);
    console.error("📚 Stack trace:", error.stack);
  }

  console.log("\n🏁 Debug completed!");
  console.log("=".repeat(50));
};

// Run debug if called directly
if (require.main === module) {
  runDebug().catch(console.error);
}

module.exports = {
  debugEmailConfig,
  debugAdminUsers,
  debugSendEmail,
  runDebug,
};
