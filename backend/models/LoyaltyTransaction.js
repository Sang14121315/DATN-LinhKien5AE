const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['earn', 'redeem'], required: true }, // earn: cộng điểm, redeem: trừ điểm
  points: { type: Number, required: true },
  description: { type: String }, // Lý do giao dịch
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);

