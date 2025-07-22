const Notification = require('../models/Notification');

class NotificationService {
  static async getAll(filters = {}) {
    return await Notification.find(filters).populate('user_id');
  }

  static async getById(id) {
    const notification = await Notification.findById(id).populate('user_id');
    if (!notification) throw new Error('Notification not found');
    return notification;
  }

  static async getByUser(userId) {
    return await Notification.find({ user_id: userId })
      .populate('related_id', 'status total -_id')
      .sort({ created_at: -1 });
  }

  static async create(data) {
    return await Notification.create(data);
  }

  static async update(id, data) {
    const notification = await Notification.findByIdAndUpdate(id, data, { new: true });
    if (!notification) throw new Error('Notification not found');
    return notification;
  }

  static async delete(id) {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) throw new Error('Notification not found');
    return true;
  }
}

module.exports = NotificationService;
