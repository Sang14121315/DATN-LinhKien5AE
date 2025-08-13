const FavoriteService = require('../services/FavoriteService');

exports.addFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;
    const favorite = await FavoriteService.add(userId, product_id);
    res.json(favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;
    await FavoriteService.remove(userId, product_id);
    res.json({ message: 'Đã bỏ yêu thích' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await FavoriteService.getUserFavorites(userId);
    res.json(favorites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
