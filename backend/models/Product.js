const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  reserved_stock: { type: Number, default: 0 }, // ✅ THÊM FIELD MỚI: Số lượng đã reserve
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

// ✅ THÊM VIRTUAL FIELD: available_stock (stock thực tế có thể bán)
productSchema.virtual('available_stock').get(function() {
  return this.stock - (this.reserved_stock || 0);
});

// ✅ THÊM STATIC METHODS cho inventory management
productSchema.statics.reserveStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  
  const availableStock = product.stock - (product.reserved_stock || 0);
  if (availableStock < quantity) {
    throw new Error(`Không đủ hàng trong kho. Còn lại: ${availableStock}, yêu cầu: ${quantity}`);
  }
  
  return await this.findByIdAndUpdate(
    productId,
    { 
      $inc: { reserved_stock: quantity },
      updated_at: new Date()
    },
    { new: true }
  );
};

productSchema.statics.releaseReservedStock = async function(productId, quantity) {
  const product = await this.findById(productId);
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  const currentReserved = product.reserved_stock || 0;
  const releaseAmount = Math.min(quantity, currentReserved);

  return await this.findByIdAndUpdate(
    productId,
    { 
      $inc: { reserved_stock: -releaseAmount },
      updated_at: new Date()
    },
    { new: true }
  );
};

// ✅ FIX: Logic confirmSale - CHUYỂN VỀ HỆ THỐNG RESERVE ĐÚNG
productSchema.statics.confirmSale = async function(productId, quantity) {
  const product = await this.findById(productId);
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  const currentReserved = product.reserved_stock || 0;
  const confirmAmount = Math.min(quantity, currentReserved);

  // ✅ LOGIC ĐÚNG: Khi đơn hàng hoàn thành:
  // 1. Trừ stock thực tế (vì đã bán)
  // 2. Trừ reserved_stock (vì không còn giữ nữa)
  return await this.findByIdAndUpdate(
    productId,
    { 
      $inc: { 
        stock: -confirmAmount,           // Trừ tồn kho thực
        reserved_stock: -confirmAmount   // Bỏ giữ hàng
      },
      updated_at: new Date()
    },
    { new: true }
  );
};

// ✅ THÊM METHOD kiểm tra stock có thể đặt hàng
productSchema.methods.canReserve = function(quantity) {
  const availableStock = this.stock - (this.reserved_stock || 0);
  return availableStock >= quantity;
};

// ✅ THÊM METHOD debug để kiểm tra trạng thái inventory
productSchema.methods.getInventoryStatus = function() {
  return {
    product_id: this._id,
    name: this.name,
    total_stock: this.stock,
    reserved_stock: this.reserved_stock || 0,
    available_stock: this.stock - (this.reserved_stock || 0),
    is_available: (this.stock - (this.reserved_stock || 0)) > 0
  };
};

module.exports = mongoose.model('Product', productSchema);