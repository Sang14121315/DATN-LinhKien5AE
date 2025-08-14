const ContactService = require("../services/ContactService");
const Joi = require("joi");
const UserService = require("../services/userService");
const {
  sendAdminNotificationEmail,
} = require("../utils/adminNotificationEmailService");

const contactSchema = Joi.object({
  title: Joi.string().min(2).required().label("Tiêu đề"),
  message: Joi.string().min(10).required().label("Nội dung"),
  name: Joi.string().min(2).required().label("Họ và tên"),
  email: Joi.string().email().required().label("Email"),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .label("Số điện thoại"),
  user_id: Joi.string().optional(),
});

exports.createContact = async (req, res) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // Nếu không có user_id thì xóa khỏi req.body để tránh lỗi
    if (!req.body.user_id) delete req.body.user_id;

    const contact = await ContactService.create(req.body);

    // Gửi email thông báo cho admin cụ thể
    try {
      console.log("🔧 Starting admin notification process...");

      // Gửi email cho admin cụ thể: ngtien.2610@gmail.com
      const targetAdminEmail = "ngtien.2610@gmail.com";
      console.log(`📧 Target admin email: ${targetAdminEmail}`);

      console.log("🔧 Sending admin notification email...");
      const emailResult = await sendAdminNotificationEmail(
        req.body,
        targetAdminEmail
      );

      if (emailResult.success) {
        console.log(
          "✅ Admin notification email sent successfully:",
          emailResult.messageId
        );
      } else {
        console.log("⚠️ Failed to send admin notification email");
      }
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError);
      console.error("❌ Error stack:", emailError.stack);
      // Không throw error để không ảnh hưởng đến việc tạo contact
    }

    const io = req.app.get("io");
    if (io) {
      const admins = await UserService.getAll({ role: "admin" });
      if (admins.length > 0) {
        io.to(admins[0]._id.toString()).emit("new-notification", {
          user_id: admins[0]._id,
          content: `Tin nhắn liên hệ mới từ ${req.body.name} về: ${req.body.title}`,
          type: "contact_message",
          related_id: contact.message_id,
          related_model: "Message",
          related_action: "chat_with_admin",
        });
        io.to(admins[0]._id.toString()).emit("new-message", {
          message: {
            _id: contact.message_id,
            content: `Liên hệ từ ${req.body.name} (${req.body.email}, ${req.body.phone}): ${req.body.title} - ${req.body.message}`,
            sender_info: {
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
            },
            receiver_id: admins[0]._id,
            created_at: new Date(),
          },
        });
      }
    }

    res
      .status(201)
      .json({ message: "Tin nhắn liên hệ đã được gửi thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi gửi tin nhắn liên hệ" });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const contacts = await ContactService.getAll(filters);
    res.json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi lấy danh sách liên hệ" });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "replied", "closed"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const contact = await ContactService.update(req.params.id, { status });
    if (!contact) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tin nhắn liên hệ" });
    }
    res.json(contact);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi cập nhật tin nhắn liên hệ" });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "replied", "closed"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const contact = await ContactService.update(req.params.id, { status });
    if (!contact) {
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi khi cập nhật trạng thái liên hệ",
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await ContactService.getById(req.params.id);
    if (!contact)
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    res.json(contact);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi lấy chi tiết liên hệ" });
  }
};

exports.replyContact = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || reply.length < 2)
      return res
        .status(400)
        .json({ message: "Nội dung phản hồi không hợp lệ" });

    const contact = await ContactService.reply(req.params.id, reply);
    if (!contact)
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });

    // Kiểm tra xem có gửi email thành công không
    let emailStatus = "not_sent";
    if (contact.email) {
      try {
        const {
          sendContactReplyEmail,
        } = require("../utils/contactReplyEmailService");
        const contactData = {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          message: contact.message,
        };
        await sendContactReplyEmail(contactData, reply);
        emailStatus = "sent";
      } catch (error) {
        console.error("❌ Error sending contact reply email:", error);
        emailStatus = "failed";
      }
    }

    res.json({
      message: "Đã gửi phản hồi cho khách hàng",
      contact,
      emailStatus,
      emailSent: emailStatus === "sent",
      emailFailed: emailStatus === "failed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi khi gửi phản hồi" });
  }
};

exports.openContact = async (req, res) => {
  try {
    const contact = await ContactService.update(req.params.id, {
      status: "pending",
    });
    if (!contact)
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    res.json(contact);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Lỗi khi mở lại liên hệ" });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await ContactService.delete(req.params.id);
    if (!contact)
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    res.json({ message: "Đã xóa liên hệ" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi khi xóa liên hệ" });
  }
};
