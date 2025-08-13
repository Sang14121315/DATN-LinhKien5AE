const Contact = require("../models/Contact");
const MessageService = require("./MessageService");
const NotificationService = require("./notificationService");
const UserService = require("./userService");
const { sendContactReplyEmail } = require("../utils/contactReplyEmailService");

class ContactService {
  static async create(data) {
    let user = null;
    if (data.user_id) {
      user = await UserService.getById(data.user_id);
      if (!user) throw new Error("Invalid user ID");
    }

    const admins = await UserService.getAll({ role: "admin" });
    if (admins.length === 0) throw new Error("No admin available");

    const contactData = {
      title: data.title,
      message: data.message,
      name: data.name,
      email: data.email,
      phone: data.phone,
      user_id: user ? user._id : null,
      status: "pending",
    };
    const contact = await Contact.create(contactData);

    const messageData = {
      sender_id: user ? user._id : null,
      receiver_id: admins[0]._id,
      content: `Liên hệ từ ${data.name} (${data.email}, ${data.phone}): ${data.title} - ${data.message}`,
      sender_info: { name: data.name, email: data.email, phone: data.phone },
    };
    const message = await MessageService.create(messageData);

    contact.message_id = message._id;
    await contact.save();

    await NotificationService.create({
      user_id: admins[0]._id,
      content: `Tin nhắn liên hệ mới từ ${data.name} (${data.email}) về: ${data.title}`,
      type: "contact_message",
      related_id: message._id,
      related_model: "Message",
      related_action: "chat_with_admin",
    });

    return contact;
  }

  static async getAll(filters = {}) {
    return await Contact.find(filters)
      .populate("user_id", "name email")
      .populate("message_id")
      .sort({ created_at: -1 });
  }

  static async update(id, data) {
    return await Contact.findByIdAndUpdate(id, data, { new: true });
  }

  static async getById(id) {
    return await Contact.findById(id);
  }

  static async reply(id, reply) {
    const contact = await Contact.findById(id);
    if (!contact) return null;

    contact.reply = reply;
    contact.status = "replied";
    contact.updated_at = new Date();
    await contact.save();

    // Gửi email phản hồi cho khách hàng
    if (contact.email) {
      try {
        const contactData = {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          message: contact.message,
        };

        await sendContactReplyEmail(contactData, reply);
        console.log(
          "✅ Contact reply email sent successfully to:",
          contact.email
        );
      } catch (error) {
        console.error("❌ Error sending contact reply email:", error);
        // Không throw error để không ảnh hưởng đến việc lưu reply
        // Chỉ log lỗi để admin biết
      }
    }

    return contact;
  }

  static async delete(id) {
    return await Contact.findByIdAndDelete(id);
  }
}

module.exports = ContactService;
