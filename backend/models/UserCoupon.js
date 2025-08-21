const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
  redeemedAt: { type: Date, default: Date.now },
  isUsed: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserCoupon', userCouponSchema);
