const NotificationService = require('../services/notificationService');
const Joi = require('joi');

const notificationSchema = Joi.object({
  user_id: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.string().valid('order_placed', 'order_cancelled', 'user_feedback', 'other').required(),
  related_id: Joi.string().optional(),
  related_model: Joi.string().valid('Order', 'User', 'Message').optional(),
  related_action: Joi.string().valid('view_order', 'chat_with_admin', 'none').optional(),
  read: Joi.boolean().optional()
});

const getNotifications = async (req, res) => {
  try {
    const { user_id, read } = req.query;
    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (read !== undefined) filters.read = read === 'true';

    const notifications = await NotificationService.getAll(filters);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await NotificationService.getById(req.params.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching notification' });
  }
};

const getNotificationsByUser = async (req, res, next) => {
  try {
    const notifications = await NotificationService.getByUser(req.user._id);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { error } = notificationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { user_id, content, type, related_id, related_model, related_action } = req.body;
    const notification = await NotificationService.create({
      user_id,
      content,
      type,
      related_id,
      related_model,
      related_action: related_action || 'none'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(user_id.toString()).emit('new-notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const updateNotification = async (req, res) => {
  try {
    const { error } = notificationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const notification = await NotificationService.update(req.params.id, req.body);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating notification' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await NotificationService.delete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting notification' });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  updateNotification,
  deleteNotification
};