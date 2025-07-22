const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount_type: { type: String, enum: ['percentage', 'fixed'], required: true },
  discount_value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  max_uses: { type: Number, default: Infinity },
  used_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);