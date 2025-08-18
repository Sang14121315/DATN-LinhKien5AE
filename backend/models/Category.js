const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  img_url: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // parent category
  // Loại bỏ productType field
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Virtual field để check xem có phải parent category không
categorySchema.virtual('isParent').get(function() {
  return this.parent === null;
});

// Virtual field để lấy children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

module.exports = mongoose.model('Category', categorySchema);