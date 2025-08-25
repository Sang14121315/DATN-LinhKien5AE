const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');

exports.getHomeData = async (req, res) => {
  try {
    const saleProducts = await ProductService.getAll(
      { sale: { $gt: 0 } },
      8,
      { updated_at: -1, created_at: -1 } // ưu tiên sản phẩm được cập nhật gần nhất, sau đó mới nhất
    );

    const hotProducts = await ProductService.getAll(
      { hot: true },
      8,
      { updated_at: -1, created_at: -1 } // ưu tiên sản phẩm được cập nhật gần nhất, sau đó mới nhất
    );

    const bestSellerProducts = await ProductService.getAll(
      {},
      8,
      { view: -1, updated_at: -1, created_at: -1 } // ưu tiên view cao, sau đó cập nhật gần nhất, cuối cùng mới nhất
    );
    
    const categories = await CategoryService.getAll({}, 6); // Danh mục

    res.json({ saleProducts, hotProducts, bestSellerProducts, categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching home data' });
  }
};
