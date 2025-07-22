const CouponService = require('../services/CouponService');
const Joi = require('joi');

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

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon
};