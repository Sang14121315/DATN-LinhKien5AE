const { sendContactReplyEmail } = require("../utils/contactReplyEmailService");

// Test data
const testContactData = {
  name: "Nguyễn Văn Test",
  email: "test@example.com", // Thay bằng email thật để test
  phone: "0123456789",
  title: "Hỏi về sản phẩm laptop",
  message:
    "Tôi muốn hỏi về thông tin chi tiết của laptop Dell Inspiron 15. Có thể cho tôi biết thêm về cấu hình và giá cả không?",
};

const testAdminReply = `Chào bạn ${testContactData.name},

Cảm ơn bạn đã quan tâm đến sản phẩm Dell Inspiron 15 của chúng tôi.

Về cấu hình của laptop:
- CPU: Intel Core i5-1135G7
- RAM: 8GB DDR4
- Ổ cứng: 256GB SSD
- Màn hình: 15.6 inch Full HD
- Card đồ họa: Intel Iris Xe Graphics

Giá hiện tại: 15,990,000 VNĐ

Sản phẩm đang có sẵn tại cửa hàng và có thể giao hàng trong vòng 2-3 ngày làm việc.

Nếu bạn cần thêm thông tin hoặc muốn đặt hàng, vui lòng liên hệ hotline: 0123456789

Trân trọng,
Đội ngũ 5AELINHKIEN`;

async function testContactReplyEmail() {
  try {
    console.log("🧪 Testing contact reply email service...");
    console.log("📧 Sending test email to:", testContactData.email);

    const result = await sendContactReplyEmail(testContactData, testAdminReply);

    console.log("✅ Test successful!");
    console.log("📧 Email sent with message ID:", result.messageId);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("🔍 Error details:", error);
  }
}

// Chạy test
testContactReplyEmail();
