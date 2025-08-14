const ReviewService = require('../services/ReviewService');

exports.addReview = async (req, res) => {
  try {
    const { product_id, order_detail_id, rating, comment, images } = req.body;
    const userId = req.user.id;
    const review = await ReviewService.add(userId, product_id, order_detail_id, rating, comment, images);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;
    const review = await ReviewService.update(review_id, userId, rating, comment, images);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeReview = async (req, res) => {
  try {
    const { order_detail_id } = req.body;
    const userId = req.user.id;
    await ReviewService.remove(userId, order_detail_id);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await ReviewService.getProductReviews(product_id);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminReply = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { reply } = req.body;
    const review = await ReviewService.adminReply(review_id, reply);
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    await ReviewService.deleteReview(review_id);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserReviewsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { user_id } = req.query;
    const reviews = await ReviewService.getUserReviewsForProduct(user_id, product_id);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUnreviewedOrderDetails = async (req, res) => {
  try {
    const { product_id } = req.params;
    const userId = req.user.id;
    const unreviewedOrders = await ReviewService.getUnreviewedOrderDetails(userId, product_id);
    res.json(unreviewedOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};