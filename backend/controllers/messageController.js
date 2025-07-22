const MessageService = require('../services/MessageService');
const UserService = require('../services/userService');
const Joi = require('joi');

const messageSchema = Joi.object({
  receiver_id: Joi.string().required(),
  content: Joi.string().required().min(1)
});

// Lấy đoạn hội thoại giữa người gửi và người nhận
const getConversation = async (req, res) => {
  try {
    const { receiver_id } = req.query;
    if (!receiver_id) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }
    const messages = await MessageService.getConversation(req.user.id, receiver_id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching conversation' });
  }
};

// Gửi tin nhắn mới
const sendMessage = async (req, res) => {
  try {
    const { error } = messageSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const sender = await UserService.getById(req.user.id);
    const messageData = {
      sender_id: req.user.id,
      receiver_id: req.body.receiver_id,
      content: req.body.content,
      sender_id: { ...sender.toObject(), name: sender.name } // Gửi kèm tên để dùng cho notification
    };

    const message = await MessageService.create(messageData);

    const io = req.app.get('io');
    if (io) {
      io.to(req.body.receiver_id.toString()).emit('new-message', message);
      io.to(req.body.receiver_id.toString()).emit('new-notification', {
        user_id: req.body.receiver_id,
        content: `Bạn có tin nhắn mới từ ${sender.name}`,
        type: 'user_feedback',
        related_id: message._id,
        related_model: 'Message',
        related_action: 'chat_with_admin'
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
};

// Lấy danh sách admin
const getAdmins = async (req, res) => {
  try {
    const admins = await UserService.getAll({ role: 'admin' });
    res.json(admins.map(admin => ({
      id: admin._id,
      name: admin.name,
      email: admin.email
    })));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admins' });
  }
};

// ✅ Export rõ ràng cuối file
module.exports = {
  getConversation,
  sendMessage,
  getAdmins
};
