const CouponService = require('../services/CouponService');
const Joi = require('joi');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const Coupon = require('../models/Coupon');

const couponSchema = Joi.object({
  code: Joi.string().required(),
  discount_type: Joi.string().valid('percentage', 'fixed').required(),
  discount_value: Joi.number().required(),
  min_order_value: Joi.number().default(0),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  max_uses: Joi.number().default(Infinity),
  is_active: Joi.boolean().default(true)
});

const getCoupons = async (req, res) => {
  try {
    const { is_active } = req.query;
    const filters = {};
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    filters.pointsRequired = { $exists: true, $gt: 0 };
    const coupons = await CouponService.getAll(filters);
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching coupons' });
  }
};

const getCouponById = async (req, res) => {
  try {
    const coupon = await CouponService.getById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching coupon' });
  }
};


const createCoupon = async (req, res) => {
  try {
    const { error } = couponSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const coupon = await CouponService.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating coupon' });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { error } = couponSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const coupon = await CouponService.update(req.params.id, req.body);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating coupon' });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await CouponService.delete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting coupon' });
  }
};

// Đổi điểm lấy coupon
const redeemCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponId } = req.body;
    if (!couponId) return res.status(400).json({ message: 'Thiếu couponId' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    const coupon = await Coupon.findById(couponId);
    if (!coupon || !coupon.is_active) return res.status(404).json({ message: 'Coupon không khả dụng' });
    if (typeof coupon.pointsRequired !== 'number' || coupon.pointsRequired <= 0) return res.status(400).json({ message: 'Coupon chưa cấu hình số điểm cần đổi' });
    if ((user.loyaltyPoints || 0) < coupon.pointsRequired) return res.status(400).json({ message: 'Bạn không đủ điểm để đổi coupon này' });
    // Trừ điểm
    user.loyaltyPoints -= coupon.pointsRequired;
    await user.save();
    // Lưu lịch sử giao dịch điểm
    await LoyaltyTransaction.create({
      user_id: user._id,
      type: 'redeem',
      points: coupon.pointsRequired,
      description: `Đổi coupon: ${coupon.code}`
    });
    res.json({ success: true, message: `Đã đổi thành công coupon: ${coupon.code}`, currentPoints: user.loyaltyPoints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Lỗi đổi điểm lấy coupon' });
  }
};

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  redeemCoupon
};