const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const ProductService = require('./productService');
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
    // Sinh orderNumber duy nhất
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const orderData = {
      ...data,
      orderNumber,
      inventory_reserved: false,
      inventory_confirmed: false,
      inventory_released: false
    };
    return await Order.create(orderData);
  }

  static async update(id, data) {
    // Tự động set updated_at khi cập nhật
    const updateData = { ...data, updated_at: new Date() };
    const updated = await Order.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true, 
      context: 'query' 
    });
    if (!updated) throw new Error('Order not found');
    return updated;
  }

  static async delete(id) {
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) throw new Error('Order not found');
    return true;
  }

  // ✅ THÊM: Inventory Management Methods

  /**
   * Reserve inventory cho tất cả items trong order
   * @param {string} orderId 
   * @returns {Promise<Order>}
   */
  static async reserveInventory(orderId) {
    console.log(`🔄 OrderService: Starting inventory reservation for order ${orderId}`);
    
    const order = await this.getById(orderId);
    if (order.inventory_reserved) {
      console.log(`⚠️ OrderService: Inventory already reserved for order ${orderId}`);
      return order;
    }

    // Lấy order details
    const orderDetails = await OrderDetail.find({ order_id: orderId });
    if (!orderDetails.length) {
      throw new Error('Không tìm thấy chi tiết đơn hàng');
    }

    console.log(`🔄 OrderService: Found ${orderDetails.length} items to reserve`);

    // Reserve stock cho từng item
    const reservationResults = [];
    for (const detail of orderDetails) {
      try {
        const result = await ProductService.reserveStock(detail.product_id, detail.quantity);
        reservationResults.push({
          product_id: detail.product_id,
          quantity: detail.quantity,
          success: true,
          result
        });
        console.log(`✅ OrderService: Reserved ${detail.quantity} units of product ${detail.product_id}`);
      } catch (error) {
        console.error(`❌ OrderService: Failed to reserve product ${detail.product_id}:`, error.message);
        
        // Rollback: Hoàn trả tất cả stock đã reserve trước đó
        for (const prevReservation of reservationResults) {
          if (prevReservation.success) {
            try {
              await ProductService.releaseReservedStock(
                prevReservation.product_id, 
                prevReservation.quantity
              );
              console.log(`🔄 OrderService: Rolled back reservation for product ${prevReservation.product_id}`);
            } catch (rollbackError) {
              console.error(`❌ OrderService: Rollback failed for product ${prevReservation.product_id}:`, rollbackError.message);
            }
          }
        }
        
        throw error; // Re-throw để controller xử lý
      }
    }

    // Cập nhật flag inventory_reserved
    const updatedOrder = await this.update(orderId, { inventory_reserved: true });
    console.log(`✅ OrderService: Inventory reservation completed for order ${orderId}`);
    
    return updatedOrder;
  }

  /**
   * Release reserved inventory (khi hủy đơn hàng)
   * @param {string} orderId 
   * @returns {Promise<Order>}
   */
  static async releaseInventory(orderId) {
    console.log(`🔄 OrderService: Starting inventory release for order ${orderId}`);
    
    const order = await this.getById(orderId);
    if (!order.inventory_reserved || order.inventory_released) {
      console.log(`⚠️ OrderService: No inventory to release for order ${orderId} (reserved: ${order.inventory_reserved}, released: ${order.inventory_released})`);
      return order;
    }

    // Lấy order details
    const orderDetails = await OrderDetail.find({ order_id: orderId });
    if (!orderDetails.length) {
      console.log(`⚠️ OrderService: No order details found for order ${orderId}`);
      return order;
    }

    console.log(`🔄 OrderService: Found ${orderDetails.length} items to release`);

    // Release stock cho từng item
    for (const detail of orderDetails) {
      try {
        await ProductService.releaseReservedStock(detail.product_id, detail.quantity);
        console.log(`✅ OrderService: Released ${detail.quantity} units of product ${detail.product_id}`);
      } catch (error) {
        console.error(`❌ OrderService: Failed to release product ${detail.product_id}:`, error.message);
        // Tiếp tục release các items khác ngay cả khi có lỗi
      }
    }

    // Cập nhật flag inventory_released
    const updatedOrder = await this.update(orderId, { inventory_released: true });
    console.log(`✅ OrderService: Inventory release completed for order ${orderId}`);
    
    return updatedOrder;
  }

  /**
   * Confirm inventory (khi hoàn thành đơn hàng)
   * @param {string} orderId 
   * @returns {Promise<Order>}
   */
  static async confirmInventory(orderId) {
    console.log(`🔄 OrderService: Starting inventory confirmation for order ${orderId}`);
    
    const order = await this.getById(orderId);
    if (!order.inventory_reserved || order.inventory_confirmed) {
      console.log(`⚠️ OrderService: No inventory to confirm for order ${orderId} (reserved: ${order.inventory_reserved}, confirmed: ${order.inventory_confirmed})`);
      return order;
    }

    // Lấy order details
    const orderDetails = await OrderDetail.find({ order_id: orderId });
    if (!orderDetails.length) {
      console.log(`⚠️ OrderService: No order details found for order ${orderId}`);
      return order;
    }

    console.log(`🔄 OrderService: Found ${orderDetails.length} items to confirm`);

    // Confirm sale cho từng item
    for (const detail of orderDetails) {
      try {
        await ProductService.confirmSale(detail.product_id, detail.quantity);
        console.log(`✅ OrderService: Confirmed sale of ${detail.quantity} units of product ${detail.product_id}`);
      } catch (error) {
        console.error(`❌ OrderService: Failed to confirm sale for product ${detail.product_id}:`, error.message);
        // Tiếp tục confirm các items khác ngay cả khi có lỗi
      }
    }

    // Cập nhật flag inventory_confirmed
    const updatedOrder = await this.update(orderId, { inventory_confirmed: true });
    console.log(`✅ OrderService: Inventory confirmation completed for order ${orderId}`);
    
    return updatedOrder;
  }

  /**
   * Kiểm tra trạng thái inventory của order
   * @param {string} orderId 
   * @returns {Promise<Object>}
   */
  static async getInventoryStatus(orderId) {
    const order = await this.getById(orderId);
    const orderDetails = await OrderDetail.find({ order_id: orderId });
    
    const itemsStatus = [];
    for (const detail of orderDetails) {
      try {
        const inventoryInfo = await ProductService.getInventoryInfo(detail.product_id);
        itemsStatus.push({
          ...detail._doc,
          inventory_info: inventoryInfo
        });
      } catch (error) {
        itemsStatus.push({
          ...detail._doc,
          inventory_info: { error: error.message }
        });
      }
    }

    return {
      order_id: orderId,
      order_status: order.status,
      inventory_reserved: order.inventory_reserved,
      inventory_confirmed: order.inventory_confirmed,
      inventory_released: order.inventory_released,
      items: itemsStatus
    };
  }

  /**
   * Validate inventory trước khi tạo order
   * @param {Array} items - Array of { product_id, quantity }
   * @returns {Promise<Object>}
   */
  static async validateInventoryForOrder(items) {
    console.log(`🔄 OrderService: Validating inventory for ${items.length} items`);
    
    const validationResult = await ProductService.checkBulkAvailability(items);
    
    if (!validationResult.all_available) {
      const unavailableItems = validationResult.results.filter(r => !r.available);
      const errorMessage = unavailableItems
        .map(item => `${item.product_name || item.product_id}: ${item.reason}`)
        .join('; ');
      
      throw new Error(`Một số sản phẩm không đủ hàng: ${errorMessage}`);
    }

    console.log(`✅ OrderService: All items available for order`);
    return validationResult;
  }
}

// MoMo Payment Functions
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
  
  // ✅ THÊM: Inventory Management Methods
  reserveInventory: OrderService.reserveInventory,
  releaseInventory: OrderService.releaseInventory,
  confirmInventory: OrderService.confirmInventory,
  getInventoryStatus: OrderService.getInventoryStatus,
  validateInventoryForOrder: OrderService.validateInventoryForOrder,
  
  createMomoPayment
};