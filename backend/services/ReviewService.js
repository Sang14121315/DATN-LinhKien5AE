const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const mongoose = require('mongoose');

class ReviewService {
  static async addOrUpdate(userId, productId, rating, comment, isUpdate = false) {
    console.log("Checking order for user:", userId, "product:", productId, "rating:", rating, "comment:", comment, "isUpdate:", isUpdate);
    const productIdObj = new mongoose.Types.ObjectId(productId);

    // Lấy tất cả OrderDetail chứa sản phẩm và populate đơn hàng "completed" hoặc "delivered"
    const orderDetails = await OrderDetail.find({
      product_id: productIdObj,
    }).populate({
      path: 'order_id',
      match: { user_id: userId, status: { $in: ['completed', 'delivered'] } },
      select: 'user_id status created_at'
    });

    const validOrderDetails = orderDetails.filter(od => od.order_id !== null);
    console.log("Valid OrderDetails count:", validOrderDetails.length);

    if (validOrderDetails.length === 0) {
      throw new Error('Bạn chưa mua sản phẩm này hoặc đơn hàng chưa ở trạng thái "Đã giao".');
    }

    // Đếm số đánh giá hiện có của user cho sản phẩm này
    const existingReviews = await Review.find({ user_id: userId, product_id: productIdObj });
    console.log("Existing reviews count:", existingReviews.length);

    // Nếu số đánh giá bằng hoặc lớn hơn số đơn hàng, không cho phép đánh giá thêm
    if (existingReviews.length >= validOrderDetails.length && !isUpdate) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi. Bạn có muốn đánh giá lại?');
    }

    // Nếu isUpdate = true, xóa đánh giá cũ nhất
    if (isUpdate && existingReviews.length > 0) {
      await Review.findOneAndDelete(
        { user_id: userId, product_id: productIdObj },
        { sort: { created_at: 1 } }
      );
      console.log("Deleted oldest review for overwrite");
    } else if (isUpdate && existingReviews.length === 0) {
      throw new Error('Không có đánh giá để cập nhật.');
    }

    // Thêm đánh giá mới
    const newReview = new Review({
      user_id: userId,
      product_id: productIdObj,
      rating,
      comment,
      created_at: new Date(),
    });
    const savedReview = await newReview.save();
    const populatedReview = await Review.populate(savedReview, { path: 'user_id', select: 'name' });
    console.log("Saved and populated review:", populatedReview);
    return populatedReview;
  }

  static async remove(userId, productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    return await Review.findOneAndDelete({ user_id: userId, product_id: productIdObj });
  }

  static async getProductReviews(productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    return await Review.find({ product_id: productIdObj }).populate('user_id', 'name');
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
    return await Review.find({ user_id: userId, product_id: productIdObj });
  }

  static async getValidOrderCount(userId, productId) {
    const productIdObj = new mongoose.Types.ObjectId(productId);
    const orderDetails = await OrderDetail.find({
      product_id: productIdObj,
    }).populate({
      path: 'order_id',
      match: { user_id: userId, status: { $in: ['completed', 'delivered'] } },
      select: 'user_id status'
    });
    return orderDetails.filter(od => od.order_id !== null).length;
  }
}

module.exports = ReviewService;