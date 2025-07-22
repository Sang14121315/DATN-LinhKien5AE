const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);