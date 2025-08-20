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
});

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: customerSchema,
  items: [itemSchema], // Thêm trường items để lưu sản phẩm trong đơn hàng
  payment_method: { type: String, enum: ['cod', 'bank'], default: 'cod' },
  total: Number,
  orderNumber: { type: String, unique: true },
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

// ✅ Phải export đúng như thế này:
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;