const Review = require('../models/Review');

class ReviewService {
  static async addOrUpdate(userId, productId, rating, comment) {
    return await Review.findOneAndUpdate(
      { user_id: userId, product_id: productId },
      { rating, comment, created_at: new Date() },
      { upsert: true, new: true }
    );
  }

  static async remove(userId, productId) {
    return await Review.findOneAndDelete({ user_id: userId, product_id: productId });
  }

  static async getProductReviews(productId) {
    return await Review.find({ product_id: productId }).populate('user_id', 'name');
  }

  static async adminReply(reviewId, reply) {
    return await Review.findByIdAndUpdate(reviewId, { reply }, { new: true });
  }
}

module.exports = ReviewService;
