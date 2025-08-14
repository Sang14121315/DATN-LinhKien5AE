const Message = require('../models/Message');
const NotificationService = require('./notificationService');

class MessageService {
  static async getConversation(senderId, receiverId) {
    return await Message.find({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    })
      .populate('sender_id', 'name email')
      .populate('receiver_id', 'name email')
      .sort({ created_at: 1 });
  }

  static async getConversationWithAdmins(userId, adminIds) {
    return await Message.find({
      $or: [
        { sender_id: userId, receiver_id: { $in: adminIds } },
        { sender_id: { $in: adminIds }, receiver_id: userId }
      ]
    })
      .populate('sender_id', 'name email')
      .populate('receiver_id', 'name email')
      .sort({ created_at: 1 });
  }

  static async create(data) {
    const message = await Message.create(data);

    // Tạo notification cho người nhận
    await NotificationService.create({
      user_id: data.receiver_id,
      content: `Bạn có tin nhắn mới từ ${data.sender_id && data.sender_id.name ? data.sender_id.name : 'người dùng ẩn danh'}`,
      type: 'user_feedback',
      related_id: message._id,
      related_model: 'Message',
      related_action: 'chat_with_admin'
    });

    return message;
  }
}

module.exports = MessageService;