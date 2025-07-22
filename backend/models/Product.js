const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  img_url: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  sale: { type: Boolean, default: false },
  view: { type: Number, default: 0 },
  hot: { type: Boolean, default: false },
  coupons_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  product_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductType', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);