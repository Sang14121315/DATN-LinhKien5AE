const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const mongoose = require('mongoose');

class ReviewService {
  static async add(userId, productId, orderDetailId, rating, comment, images = []) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    const orderDetailIdObj = new mongoose.Types.ObjectId(orderDetailId);

    // Kiểm tra OrderDetail hợp lệ
    const orderDetail = await OrderDetail.findById(orderDetailIdObj).populate({
      path: 'order_id',
      match: { user_id: userId, status: { $in: ['completed', 'delivered'] } },
      select: 'user_id status'
    });

    if (!orderDetail || !orderDetail.order_id) {
      throw new Error('Bạn chưa mua sản phẩm này hoặc đơn hàng chưa ở trạng thái "Đã giao".');
    }

    // Kiểm tra đã review cho OrderDetail này chưa
    const existingReview = await Review.findOne({ user_id: userId, order_detail_id: orderDetailIdObj });
    if (existingReview) {
      throw new Error('Bạn đã đánh giá cho đơn hàng này. Vui lòng chỉnh sửa nếu cần.');
    }

    // Thêm review mới
    const newReview = new Review({
      user_id: userId,
      product_id: productIdObj,
      order_detail_id: orderDetailIdObj,
      rating,
      comment,
      images,
      created_at: new Date(),
    });
    const savedReview = await newReview.save();
    return await Review.populate(savedReview, { path: 'user_id', select: 'name' });
  }

  static async update(reviewId, userId, rating, comment, images = []) {
    const review = await Review.findOne({ _id: reviewId, user_id: userId });
    if (!review) {
      throw new Error('Không tìm thấy đánh giá để cập nhật.');
    }
    review.rating = rating;
    review.comment = comment;
    review.images = images;
    review.updated_at = new Date();
    const updatedReview = await review.save();
    return await Review.populate(updatedReview, { path: 'user_id', select: 'name' });
  }

  static async remove(userId, orderDetailId) {
    const orderDetailIdObj = new mongoose.Types.ObjectId(orderDetailId);
    return await Review.findOneAndDelete({ user_id: userId, order_detail_id: orderDetailIdObj });
  }

  static async getProductReviews(productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    return await Review.find({ product_id: productIdObj })
      .populate('user_id', 'name')
      .sort({ created_at: -1 });
  }

  static async adminReply(reviewId, reply) {
    return await Review.findByIdAndUpdate(reviewId, { reply }, { new: true });
  }

  static async getAllReviews() {
    return await Review.find({})
      .populate('user_id', 'name email')
      .populate('product_id', 'name img_url')
      .sort({ created_at: -1 });
  }

  static async deleteReview(reviewId) {
    return await Review.findByIdAndDelete(reviewId);
  }

  static async getUserReviewsForProduct(userId, productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    return await Review.find({ user_id: userId, product_id: productIdObj })
      .populate('user_id', 'name');
  }

  static async getUnreviewedOrderDetails(userId, productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    const orderDetails = await OrderDetail.find({ product_id: productIdObj })
      .populate({
        path: 'order_id',
        match: { user_id: userId, status: { $in: ['completed', 'delivered'] } },
        select: 'user_id status created_at'
      });

    const validOrderDetails = orderDetails.filter(od => od.order_id !== null);
    const reviewedOrderDetailIds = await Review.find({ user_id: userId, product_id: productIdObj })
      .distinct('order_detail_id');
    
    return validOrderDetails
      .filter(od => !reviewedOrderDetailIds.includes(od._id.toString()))
      .map(od => ({
        _id: od._id,
        order_id: od.order_id._id,
        product_id: od.product_id,
        quantity: od.quantity,
        price: od.price,
        name: od.name,
        img_url: od.img_url,
        order_created_at: od.order_id.created_at
      }));
  }
}

module.exports = ReviewService;