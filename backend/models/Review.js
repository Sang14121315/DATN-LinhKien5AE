// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  images: [{ type: String }],
  helpful: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  reply: { type: String, default: '' }
});

// Đổi unique index
reviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);