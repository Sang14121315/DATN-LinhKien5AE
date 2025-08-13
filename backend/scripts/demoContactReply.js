const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Demo data
const demoContact = {
  title: "Hỏi về sản phẩm laptop gaming",
  message:
    "Tôi đang tìm kiếm một laptop gaming với giá khoảng 20-25 triệu. Có thể tư vấn cho tôi một số model phù hợp không?",
  name: "Nguyễn Văn Demo",
  email: "demo@example.com", // Thay bằng email thật để test
  phone: "0987654321",
};

const demoReply = `Chào bạn ${demoContact.name},

Cảm ơn bạn đã quan tâm đến sản phẩm laptop gaming của chúng tôi.

Dựa trên ngân sách 20-25 triệu, chúng tôi có một số gợi ý sau:

1. **MSI GF63 Thin** - 22,990,000 VNĐ
   - CPU: Intel Core i5-10300H
   - RAM: 8GB DDR4
   - GPU: GTX 1650 4GB
   - Ổ cứng: 512GB SSD

2. **Acer Nitro 5** - 24,990,000 VNĐ
   - CPU: Intel Core i5-10300H
   - RAM: 8GB DDR4
   - GPU: GTX 1650 Ti 4GB
   - Ổ cứng: 512GB SSD

3. **Lenovo IdeaPad Gaming 3** - 23,990,000 VNĐ
   - CPU: AMD Ryzen 5 4600H
   - RAM: 8GB DDR4
   - GPU: GTX 1650 4GB
   - Ổ cứng: 512GB SSD

Tất cả đều có thể chơi được các game phổ biến như PUBG, Valorant, GTA V ở mức cài đặt trung bình.

Bạn có thể đến cửa hàng để trải nghiệm trực tiếp hoặc đặt hàng online.

Trân trọng,
Đội ngũ 5AELINHKIEN`;

async function demoContactReply() {
  try {
    console.log("🎬 Starting Contact Reply Demo...");
    console.log("📝 Step 1: Creating contact...");

    // Step 1: Tạo contact
    const contactResponse = await axios.post(
      `${API_BASE}/contacts`,
      demoContact
    );
    console.log("✅ Contact created:", contactResponse.data.message);

    const contactId = contactResponse.data.contact._id;
    console.log("📋 Contact ID:", contactId);

    // Step 2: Lấy danh sách contacts
    console.log("\n📋 Step 2: Fetching contacts...");
    const contactsResponse = await axios.get(`${API_BASE}/contacts`);
    console.log("✅ Found", contactsResponse.data.length, "contacts");

    // Step 3: Gửi phản hồi
    console.log("\n💬 Step 3: Sending reply...");
    const replyResponse = await axios.post(
      `${API_BASE}/contacts/${contactId}/reply`,
      {
        reply: demoReply,
      }
    );

    console.log("✅ Reply sent successfully!");
    console.log("📧 Email status:", replyResponse.data.emailStatus);
    console.log("📧 Email sent:", replyResponse.data.emailSent);
    console.log("📧 Email failed:", replyResponse.data.emailFailed);

    // Step 4: Kiểm tra contact đã được cập nhật
    console.log("\n🔍 Step 4: Checking updated contact...");
    const updatedContactResponse = await axios.get(
      `${API_BASE}/contacts/${contactId}`
    );
    const updatedContact = updatedContactResponse.data;

    console.log("✅ Contact updated:");
    console.log("   - Status:", updatedContact.status);
    console.log("   - Has reply:", !!updatedContact.reply);
    console.log(
      "   - Reply length:",
      updatedContact.reply?.length || 0,
      "characters"
    );

    console.log("\n🎉 Demo completed successfully!");
    console.log("📧 Check your email for the reply message!");
  } catch (error) {
    console.error("❌ Demo failed:", error.response?.data || error.message);
    console.error("🔍 Error details:", error);
  }
}

// Chạy demo
demoContactReply();
