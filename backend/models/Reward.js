const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên ưu đãi/quà tặng
  pointsRequired: { type: Number, required: true }, // Số điểm cần để đổi
  description: { type: String },
  type: { type: String, enum: ['voucher', 'gift', 'other'], default: 'voucher' },
  quantity: { type: Number, default: 0 }, // Số lượng còn lại (0 = không giới hạn)
  image: { type: String }, // Ảnh minh họa (nếu có)
  isActive: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reward', rewardSchema);









