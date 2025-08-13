const Order = require('../models/Order'); // ✅ Phải là object được export ở trên
const axios = require('axios');
const crypto = require('crypto');

class OrderService {
  static async getAll(filters = {}, sort = { updated_at: -1, created_at: -1 }) {
    return await Order.find(filters).sort(sort).populate('user_id');
  }

  static async count(filters = {}) {
    return await Order.countDocuments(filters);
  }

  static async getById(id) {
    const order = await Order.findById(id).populate('user_id');
    if (!order) throw new Error('Order not found');
    return order;
  }

  static async create(data) {
    return await Order.create(data);
  }

  static async update(id, data) {
    // Tự động set updated_at khi cập nhật
    const updateData = { ...data, updated_at: new Date() };
    const updated = await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, context: 'query' });
    if (!updated) throw new Error('Order not found');
    return updated;
  }

  static async delete(id) {
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) throw new Error('Order not found');
    return true;
  }
}

async function createMomoPayment(orderId, amount, redirectUrl, ipnUrl) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  const requestId = `${orderId}-${Date.now()}`;
  const orderInfo = `Thanh toán đơn hàng #${orderId}`;
  console.log('MOMO ENV:', { partnerCode, accessKey, secretKey });
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');
  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount: `${amount}`,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData: '',
    requestType: 'captureWallet',
    signature,
    lang: 'vi'
  };
  const response = await axios.post(endpoint, body);
  return response.data;
}

module.exports = {
  create: OrderService.create,
  getAll: OrderService.getAll,
  getById: OrderService.getById,
  update: OrderService.update,
  delete: OrderService.delete,
  createMomoPayment
};
