const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');

exports.getHomeData = async (req, res) => {
  try {
    const saleProducts = await ProductService.getAll({ sale: true }, 8); // Sản phẩm khuyến mãi
    const hotProducts = await ProductService.getAll({ hot: true }, 8);   // Sản phẩm nổi bật
    const bestSellerProducts = await ProductService.getAll({}, 8, { view: -1 }); // Bán chạy theo view
    const categories = await CategoryService.getAll({}, 6); // Danh mục

    res.json({ saleProducts, hotProducts, bestSellerProducts, categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching home data' });
  }
};
