const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Quý khách đang quan tâm về
  message: { type: String, required: true }, // Mô tả chi tiết
  name: { type: String, required: true }, // Họ và tên
  email: { type: String, required: true }, // Nhập Email
  phone: { type: String, required: true }, // Nhập sdt
  reply: { type: String, default: '' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  message_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  status: { type: String, enum: ['pending', 'replied', 'closed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);