const Product = require('../models/Product');

class ProductService {
  static async getAll(filters = {}, limit = 0, sort = {}) {
    return await Product.find(filters).populate('category_id brand_id product_type_id').limit(limit).sort(sort);
  }

  static async getById(id) {
    const product = await Product.findById(id).populate('category_id brand_id product_type_id');
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async create(data) {
    // ✅ KHỞI TẠO RESERVED_STOCK = 0 CHO SẢN PHẨM MỚI
    const productData = {
      ...data,
      reserved_stock: 0
    };
    return await Product.create(productData);
  }

  static async update(id, data) {
    // Tự động cập nhật updated_at khi chỉnh sửa sản phẩm
    const updateData = { ...data, updated_at: new Date() };
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) throw new Error('Product not found');
    return product;
  }

  static async delete(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error('Product not found');
    return true;
  }

  // ✅ THÊM: Inventory Management Methods
  
  /**
   * Reserve stock cho một sản phẩm
   * @param {string} productId 
   * @param {number} quantity 
   * @returns {Promise<Product>}
   */
  static async reserveStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    const availableStock = product.stock - (product.reserved_stock || 0);
    if (availableStock < quantity) {
      throw new Error(`Không đủ hàng trong kho. Sản phẩm "${product.name}" - Còn lại: ${availableStock}, yêu cầu: ${quantity}`);
    }
    
    return await Product.findByIdAndUpdate(
      productId,
      { 
        $inc: { reserved_stock: quantity },
        updated_at: new Date()
      },
      { new: true }
    );
  }

  /**
   * Hoàn trả reserved stock
   * @param {string} productId 
   * @param {number} quantity 
   * @returns {Promise<Product>}
   */
  static async releaseReservedStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const currentReserved = product.reserved_stock || 0;
    const releaseAmount = Math.min(quantity, currentReserved); // Không release quá số đã reserve

    return await Product.findByIdAndUpdate(
      productId,
      { 
        $inc: { reserved_stock: -releaseAmount },
        updated_at: new Date()
      },
      { new: true }
    );
  }

  /**
   * Xác nhận bán hàng (khi hoàn thành đơn hàng)
   * @param {string} productId 
   * @param {number} quantity 
   * @returns {Promise<Product>}
   */
  static async confirmSale(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const currentReserved = product.reserved_stock || 0;
    const confirmAmount = Math.min(quantity, currentReserved);

    // ✅ FIX: Trừ cả stock và reserved_stock khi confirm sale
    return await Product.findByIdAndUpdate(
      productId,
      { 
        $inc: { 
          stock: -confirmAmount,           // Trừ stock thực tế
          reserved_stock: -confirmAmount   // Trừ reserved_stock
        },
        updated_at: new Date()
      },
      { new: true }
    );
  }

  /**
   * Kiểm tra có thể reserve số lượng không
   * @param {string} productId 
   * @param {number} quantity 
   * @returns {Promise<boolean>}
   */
  static async canReserve(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) return false;
    
    const availableStock = product.stock - (product.reserved_stock || 0);
    return availableStock >= quantity;
  }

  /**
   * Lấy thông tin inventory chi tiết
   * @param {string} productId 
   * @returns {Promise<Object>}
   */
  static async getInventoryInfo(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const reservedStock = product.reserved_stock || 0;
    const availableStock = product.stock - reservedStock;

    return {
      product_id: product._id,
      product_name: product.name,
      total_stock: product.stock,
      reserved_stock: reservedStock,
      available_stock: availableStock,
      is_available: availableStock > 0,
      updated_at: product.updated_at
    };
  }

  /**
   * Kiểm tra availability cho nhiều sản phẩm
   * @param {Array} items - Array of { product_id, quantity }
   * @returns {Promise<Object>}
   */
  static async checkBulkAvailability(items) {
    const results = [];
    let allAvailable = true;

    for (const item of items) {
      try {
        const product = await Product.findById(item.product_id);
        if (!product) {
          results.push({
            product_id: item.product_id,
            requested_quantity: item.quantity,
            available: false,
            reason: 'Sản phẩm không tồn tại'
          });
          allAvailable = false;
          continue;
        }

        const reservedStock = product.reserved_stock || 0;
        const availableStock = product.stock - reservedStock;
        const canReserve = availableStock >= item.quantity;

        results.push({
          product_id: item.product_id,
          product_name: product.name,
          requested_quantity: item.quantity,
          available_stock: availableStock,
          total_stock: product.stock,
          reserved_stock: reservedStock,
          available: canReserve,
          reason: canReserve ? 'Có thể đặt hàng' : `Không đủ hàng. Còn lại: ${availableStock}, yêu cầu: ${item.quantity}`
        });

        if (!canReserve) {
          allAvailable = false;
        }
      } catch (error) {
        results.push({
          product_id: item.product_id,
          requested_quantity: item.quantity,
          available: false,
          reason: `Lỗi kiểm tra: ${error.message}`
        });
        allAvailable = false;
      }
    }

    return {
      all_available: allAvailable,
      results: results
    };
  }

  /**
   * Cập nhật stock (cho admin)
   * @param {string} productId 
   * @param {number} newStock 
   * @returns {Promise<Product>}
   */
  static async updateStock(productId, newStock) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const reservedStock = product.reserved_stock || 0;
    if (newStock < reservedStock) {
      throw new Error(`Stock mới (${newStock}) không thể nhỏ hơn số lượng đã reserve (${reservedStock})`);
    }

    return await Product.findByIdAndUpdate(
      productId,
      { 
        stock: newStock,
        updated_at: new Date()
      },
      { new: true }
    );
  }
}

module.exports = ProductService;