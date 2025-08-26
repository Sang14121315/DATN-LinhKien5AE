const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');
const Review = require('../models/Review');

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

    // Bổ sung rating trung bình cho từng sản phẩm
    async function addAverageRating(products) {
      return await Promise.all(products.map(async product => {
        const reviews = await Review.find({ product_id: product._id });
        let averageRating = 0;
        if (reviews.length > 0) {
          averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        }
        return {
          ...product._doc,
          available_stock: product.stock - (product.reserved_stock || 0),
          is_available: (product.stock - (product.reserved_stock || 0)) > 0,
          average_rating: averageRating
        };
      }));
    }

    const saleProductsWithRating = await addAverageRating(saleProducts);
    const hotProductsWithRating = await addAverageRating(hotProducts);
    const bestSellerProductsWithRating = await addAverageRating(bestSellerProducts);

    res.json({ saleProducts: saleProductsWithRating, hotProducts: hotProductsWithRating, bestSellerProducts: bestSellerProductsWithRating, categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching home data' });
  }
};
