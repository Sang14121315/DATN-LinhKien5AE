const Coupon = require('../models/Coupon');
const NotificationService = require('./notificationService');

class CouponService {
  static async getByCode(code) {
    return await Coupon.findOne({ code, is_active: true });
  }

  static async validateAndApply(couponCode, orderTotal, userId) {
    const coupon = await this.getByCode(couponCode);
    if (!coupon) {
      throw new Error('Invalid or inactive coupon');
    }

    const now = new Date();
    if (now < coupon.start_date || now > coupon.end_date) {
      throw new Error('Coupon is expired');
    }

    if (orderTotal < coupon.min_order_value) {
      throw new Error(`Order total must be at least ${coupon.min_order_value}`);
    }

    if (coupon.used_count >= coupon.max_uses) {
      throw new Error('Coupon has reached maximum uses');
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (coupon.discount_value / 100) * orderTotal;
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }

    coupon.used_count += 1;
    await coupon.save();

    await NotificationService.create({
      user_id: userId,
      content: `Voucher ${coupon.code} đã được áp dụng thành công! Bạn được giảm ${discount} VNĐ.`,
      type: 'other',
      related_id: coupon._id,
      related_model: 'Coupon',
      related_action: 'none'
    });

    return { coupon, discount };
  }

  static async create(data) {
    return await Coupon.create(data);
  }

  static async getAll(filters = {}) {
    return await Coupon.find(filters);
  }

  static async getById(id) {
    return await Coupon.findById(id);
  }

  static async update(id, data) {
    if ('created_at' in data) delete data.created_at;
    return await Coupon.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id) {
    return await Coupon.findByIdAndDelete(id);
  }
}

module.exports = CouponService;