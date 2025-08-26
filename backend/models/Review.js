// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order_detail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  images: [{ type: String }],
  helpful: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  reply: { type: String, default: '' }
});

// Đổi unique index: chỉ unique khi order_detail_id khác null
reviewSchema.index(
  { user_id: 1, order_detail_id: 1 },
  { unique: true, partialFilterExpression: { order_detail_id: { $exists: true, $ne: null } } }
);

module.exports = mongoose.model('Review', reviewSchema);