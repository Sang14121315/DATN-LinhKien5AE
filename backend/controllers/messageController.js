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
    // Nếu receiver_id là 'admin', lấy tất cả tin nhắn giữa user và các admin
    if (receiver_id === 'admin') {
      const admins = await UserService.getAll({ role: 'admin' });
      const adminIds = admins.map(a => a.id || a._id);
      const messages = await MessageService.getConversationWithAdmins(req.user.id, adminIds);
      return res.json(messages);
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
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ message: 'receiver_id and content are required' });
    const sender = await UserService.getById(req.user.id);
    // Gửi cho 'admin', gửi cho tất cả admin
    if (receiver_id === 'admin') {
      const admins = await UserService.getAll({ role: 'admin' });
      const results = [];
      for (const admin of admins) {
        const messageData = {
          sender_id: req.user.id,
          receiver_id: admin._id,
          content
        };
        const message = await MessageService.create(messageData);
        console.log('[BACKEND] Tạo message cho admin:', message);
        results.push(message);
      }
      const io = req.app.get('io');
      if (io) {
        for (const admin of admins) {
          const msg = results.find(m => m.receiver_id.toString() === admin._id.toString());
          console.log('[BACKEND] Emit new-message cho admin:', admin._id.toString(), msg);
          io.to(admin._id.toString()).emit('new-message', msg);
        }
        // Emit cho cả user gửi
        console.log('[BACKEND] Emit new-message cho user gửi:', req.user.id.toString(), results[0]);
        io.to(req.user.id.toString()).emit('new-message', results[0]);
      }
      console.log('[BACKEND] Trả về cho client:', results);
      return res.status(201).json(results);
    }
    // Gửi cho 1 người cụ thể
    const messageData = {
      sender_id: req.user.id,
      receiver_id,
      content
    };
    const message = await MessageService.create(messageData);
    console.log('[BACKEND] Tạo message:', message);
    const io = req.app.get('io');
    if (io) {
      // Emit cho cả receiver và sender
      console.log('[BACKEND] Emit new-message cho receiver:', receiver_id.toString(), message);
      io.to(receiver_id.toString()).emit('new-message', message);
      console.log('[BACKEND] Emit new-message cho sender:', req.user.id.toString(), message);
      io.to(req.user.id.toString()).emit('new-message', message);
    }
    console.log('[BACKEND] Trả về cho client:', message);
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
