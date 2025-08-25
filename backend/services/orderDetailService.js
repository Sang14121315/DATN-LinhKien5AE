const OrderDetail = require('../models/OrderDetail');

class OrderDetailService {
  static async getAll() {
    return await OrderDetail.find().populate('product_id');
  }

  static async getByOrderId(orderId) {
    const details = await OrderDetail.find({ order_id: orderId }).populate('product_id');
    if (!details.length) throw new Error('Order details not found');
    return details;
  }

  static async createMany(details) {
    // ✅ THÊM THÔNG TIN INVENTORY CHO MỖI ORDER DETAIL
    const detailsWithInventoryInfo = details.map(detail => ({
      ...detail,
      reserved_quantity: detail.quantity, // Số lượng sẽ được reserve
      is_stock_reserved: false // Sẽ được cập nhật sau khi reserve thành công
    }));
    
    return await OrderDetail.insertMany(detailsWithInventoryInfo);
  }

  static async deleteByOrderId(orderId) {
    return await OrderDetail.deleteMany({ order_id: orderId });
  }

  // ✅ THÊM: Methods hỗ trợ inventory management

  /**
   * Lấy order details với thông tin inventory
   * @param {string} orderId 
   * @returns {Promise<Array>}
   */
  static async getByOrderIdWithInventory(orderId) {
    const details = await OrderDetail.find({ order_id: orderId })
      .populate({
        path: 'product_id',
        select: 'name stock reserved_stock price img_url'
      });
    
    if (!details.length) {
      throw new Error('Order details not found');
    }

    // Thêm thông tin available stock cho mỗi item
    return details.map(detail => {
      const product = detail.product_id;
      const availableStock = product ? (product.stock - (product.reserved_stock || 0)) : 0;
      
      return {
        ...detail._doc,
        product_available_stock: availableStock,
        can_fulfill: availableStock >= detail.quantity
      };
    });
  }

  /**
   * Cập nhật trạng thái reserve cho order details
   * @param {string} orderId 
   * @param {boolean} isReserved 
   * @returns {Promise<Array>}
   */
  static async updateReserveStatus(orderId, isReserved) {
    return await OrderDetail.updateMany(
      { order_id: orderId },
      { 
        is_stock_reserved: isReserved,
        updated_at: new Date()
      }
    );
  }

  /**
   * Lấy tổng số lượng đã reserve theo product
   * @param {string} productId 
   * @returns {Promise<number>}
   */
  static async getTotalReservedByProduct(productId) {
    const pipeline = [
      {
        $match: {
          product_id: productId,
          is_stock_reserved: true
        }
      },
      {
        $group: {
          _id: null,
          total_reserved: { $sum: '$reserved_quantity' }
        }
      }
    ];

    const result = await OrderDetail.aggregate(pipeline);
    return result.length > 0 ? result[0].total_reserved : 0;
  }

  /**
   * Lấy danh sách order details cần xử lý inventory
   * @param {string} status - 'pending_reserve' | 'pending_confirm' | 'pending_release'
   * @returns {Promise<Array>}
   */
  static async getInventoryPendingItems(status) {
    let filter = {};
    
    switch (status) {
      case 'pending_reserve':
        filter = { is_stock_reserved: false };
        break;
      case 'pending_release':
        filter = { is_stock_reserved: true };
        break;
      default:
        filter = {};
    }

    return await OrderDetail.find(filter)
      .populate('order_id')
      .populate('product_id');
  }

  /**
   * Tạo báo cáo inventory impact
   * @param {string} orderId 
   * @returns {Promise<Object>}
   */
  static async getInventoryImpactReport(orderId) {
    const details = await this.getByOrderIdWithInventory(orderId);
    
    const impact = {
      order_id: orderId,
      total_items: details.length,
      fulfillable_items: 0,
      problematic_items: 0,
      items: []
    };

    for (const detail of details) {
      const itemImpact = {
        product_id: detail.product_id._id,
        product_name: detail.product_id.name,
        requested_quantity: detail.quantity,
        available_stock: detail.product_available_stock,
        can_fulfill: detail.can_fulfill,
        stock_shortage: detail.can_fulfill ? 0 : (detail.quantity - detail.product_available_stock)
      };

      impact.items.push(itemImpact);

      if (detail.can_fulfill) {
        impact.fulfillable_items++;
      } else {
        impact.problematic_items++;
      }
    }

    impact.can_fulfill_order = impact.problematic_items === 0;
    
    return impact;
  }

  /**
   * Validate order details trước khi tạo
   * @param {Array} details 
   * @returns {Promise<Object>}
   */
  static async validateOrderDetails(details) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Kiểm tra duplicate products trong cùng order
    const productIds = details.map(d => d.product_id.toString());
    const duplicates = productIds.filter((id, index) => productIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      validation.errors.push(`Sản phẩm bị trùng lặp trong đơn hàng: ${duplicates.join(', ')}`);
      validation.valid = false;
    }

    // Kiểm tra số lượng > 0
    const invalidQuantities = details.filter(d => d.quantity <= 0);
    if (invalidQuantities.length > 0) {
      validation.errors.push(`Số lượng phải lớn hơn 0`);
      validation.valid = false;
    }

    // Kiểm tra giá > 0
    const invalidPrices = details.filter(d => d.price <= 0);
    if (invalidPrices.length > 0) {
      validation.errors.push(`Giá sản phẩm phải lớn hơn 0`);
      validation.valid = false;
    }

    return validation;
  }

  /**
   * Lấy order detail theo ID với thông tin inventory
   * @param {string} detailId 
   * @returns {Promise<Object>}
   */
  static async getByIdWithInventory(detailId) {
    const detail = await OrderDetail.findById(detailId)
      .populate('product_id')
      .populate('order_id');

    if (!detail) {
      throw new Error('Order detail not found');
    }

    const product = detail.product_id;
    const availableStock = product ? (product.stock - (product.reserved_stock || 0)) : 0;

    return {
      ...detail._doc,
      product_available_stock: availableStock,
      can_fulfill: availableStock >= detail.quantity
    };
  }
}

module.exports = OrderDetailService;