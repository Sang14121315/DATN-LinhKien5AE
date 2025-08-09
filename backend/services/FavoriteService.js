const Favorite = require('../models/Favorite');

class FavoriteService {
  static async add(userId, productId) {
    return await Favorite.create({ user_id: userId, product_id: productId });
  }

  static async remove(userId, productId) {
    return await Favorite.findOneAndDelete({ user_id: userId, product_id: productId });
  }

  static async getUserFavorites(userId) {
    return await Favorite.find({ user_id: userId }).populate('product_id');
  }

  static async isFavorite(userId, productId) {
    return await Favorite.exists({ user_id: userId, product_id: productId });
  }
}

module.exports = FavoriteService;
