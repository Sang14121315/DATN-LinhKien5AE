const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  logo_data: String, // Lưu ảnh dưới dạng base64
  logo_url: String, // Giữ lại để tương thích ngược
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', brandSchema);