const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');

exports.getHomeData = async (req, res) => {
  try {
    const saleProducts = await ProductService.getAll(
  { sale: true },
  8,
  { created_at: -1 } // lấy sản phẩm mới nhất trước
);

const hotProducts = await ProductService.getAll(
  { hot: true },
  8,
  { created_at: -1 } // lấy sản phẩm mới nhất trước
);

const bestSellerProducts = await ProductService.getAll(
  {},
  8,
  { view: -1, created_at: -1 } // ưu tiên view cao, nếu bằng thì mới nhất trước
);
    const categories = await CategoryService.getAll({}, 6); // Danh mục

    res.json({ saleProducts, hotProducts, bestSellerProducts, categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching home data' });
  }
};
