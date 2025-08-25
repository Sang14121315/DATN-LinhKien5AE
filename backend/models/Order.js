const mongoose = require('mongoose');

const customerSchema = {
  name: String,
  phone: String,
  email: String,
  address: String,
};

const itemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  reserved_quantity: { type: Number, default: 0 }, // ✅ THÊM: Số lượng đã reserve cho item này
  is_stock_reserved: { type: Boolean, default: false } // ✅ THÊM: Flag đánh dấu đã reserve stock
});

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: customerSchema,
  items: [itemSchema], // Thêm trường items để lưu sản phẩm trong đơn hàng
  payment_method: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  total: Number,
  orderNumber: { type: String, unique: true },
  // ✅ THÊM: Inventory management flags
  inventory_reserved: { type: Boolean, default: false }, // Đã reserve stock
  inventory_confirmed: { type: Boolean, default: false }, // Đã xác nhận bán (khi completed)
  inventory_released: { type: Boolean, default: false }, // Đã hoàn trả stock (khi canceled)
  
  // Trạng thái đơn hàng: chuẩn hóa và giới hạn các giá trị hợp lệ
  status: { 
    type: String, 
    enum: [
      'pending',     // Chờ xử lý
      'confirmed',   // Đã xác nhận
      'shipping',    // Đang giao hàng
      'completed',   // Hoàn thành/Đã giao
      'canceled',    // Đã hủy (chuẩn hóa)
      'cancelled',   // Biến thể cũ để tương thích dữ liệu cũ
      'paid',        // Đã thanh toán (từ MoMo)
      'failed',      // Thanh toán thất bại (từ MoMo)
      'processing',  // Đang xử lý (tùy trường hợp)
      'delivered'    // Alias của completed (tương thích nội dung email)
    ], 
    default: 'pending' 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// ✅ THÊM STATIC METHOD: Reserve stock cho tất cả items trong order
orderSchema.statics.reserveInventory = async function(orderId) {
  const Product = require('./Product');
  const OrderDetail = require('./OrderDetail');
  
  const order = await this.findById(orderId);
  if (!order || order.inventory_reserved) {
    return order; // Đã reserve rồi hoặc order không tồn tại
  }
  
  // Lấy order details
  const orderDetails = await OrderDetail.find({ order_id: orderId });
  
  // Reserve stock cho từng sản phẩm
  for (const detail of orderDetails) {
    await Product.reserveStock(detail.product_id, detail.quantity);
  }
  
  // Cập nhật flag
  await this.findByIdAndUpdate(orderId, {
    inventory_reserved: true,
    updated_at: new Date()
  });
  
  return await this.findById(orderId);
};

// ✅ THÊM STATIC METHOD: Release reserved stock khi hủy
orderSchema.statics.releaseInventory = async function(orderId) {
  const Product = require('./Product');
  const OrderDetail = require('./OrderDetail');
  
  const order = await this.findById(orderId);
  if (!order || !order.inventory_reserved || order.inventory_released) {
    return order; // Chưa reserve hoặc đã release rồi
  }
  
  // Lấy order details
  const orderDetails = await OrderDetail.find({ order_id: orderId });
  
  // Release stock cho từng sản phẩm
  for (const detail of orderDetails) {
    await Product.releaseReservedStock(detail.product_id, detail.quantity);
  }
  
  // Cập nhật flags
  await this.findByIdAndUpdate(orderId, {
    inventory_released: true,
    updated_at: new Date()
  });
  
  return await this.findById(orderId);
};

// ✅ THÊM STATIC METHOD: Confirm sale khi hoàn thành đơn hàng
orderSchema.statics.confirmInventory = async function(orderId) {
  const Product = require('./Product');
  const OrderDetail = require('./OrderDetail');
  
  const order = await this.findById(orderId);
  if (!order || !order.inventory_reserved || order.inventory_confirmed) {
    return order; // Chưa reserve hoặc đã confirm rồi
  }
  
  // Lấy order details
  const orderDetails = await OrderDetail.find({ order_id: orderId });
  
  // Confirm sale cho từng sản phẩm (chỉ trừ reserved_stock)
  for (const detail of orderDetails) {
    await Product.confirmSale(detail.product_id, detail.quantity);
  }
  
  // Cập nhật flag
  await this.findByIdAndUpdate(orderId, {
    inventory_confirmed: true,
    updated_at: new Date()
  });
  
  return await this.findById(orderId);
};

// ✅ Phải export đúng như thế này:
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;