const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order_detail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  images: [{ type: String }], // Ảnh đính kèm
  helpful: { type: Number, default: 0 }, // Lượt hữu ích
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  reply: { type: String, default: '' }
});

reviewSchema.index({ user_id: 1, order_detail_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);