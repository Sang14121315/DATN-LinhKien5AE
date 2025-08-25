const ProductService = require('../services/productService');
const Product = require('../models/Product'); // ✅ THÊM
const Joi = require('joi');

const productSchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  img_url: Joi.string().allow(''),
  category_id: Joi.string().required(),
  sale: Joi.boolean().allow('true', 'false'),
  view: Joi.number(),
  hot: Joi.boolean(),
  coupons_id: Joi.string().allow(''),
  brand_id: Joi.string().required(),
  product_type_id: Joi.string().required()
});

exports.getProducts = async (req, res) => {
  try {
    const { name, category_id, brand_id, minPrice, maxPrice, sale, hot, sort } = req.query;
    const filters = {};
    if (name) filters.name = new RegExp(name, 'i');
    if (category_id) filters.category_id = category_id;
    if (brand_id) filters.brand_id = brand_id;
    if (minPrice || maxPrice) filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
    if (sale) filters.sale = sale === 'true';
    if (hot) filters.hot = hot === 'true';

    let query = ProductService.getAll(filters);
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });

    const products = await query;
    
    // ✅ THÊM THÔNG TIN AVAILABLE_STOCK CHO MỖI SẢN PHẨM
    const productsWithAvailableStock = products.map(product => {
      const availableStock = product.stock - (product.reserved_stock || 0);
      return {
        ...product._doc,
        available_stock: availableStock,
        is_available: availableStock > 0
      };
    });
    
    res.json(productsWithAvailableStock);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    
    // ✅ THÊM THÔNG TIN AVAILABLE_STOCK CHO SẢN PHẨM ĐƠN LẺ
    const availableStock = product.stock - (product.reserved_stock || 0);
    const productWithAvailableStock = {
      ...product._doc,
      available_stock: availableStock,
      is_available: availableStock > 0
    };
    
    res.json(productWithAvailableStock);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });


    const products = await ProductService.create({ 
      ...req.body, 
      img_url: req.file ? `/uploads/${req.file.filename}` : '',
      reserved_stock: 0 // ✅ KHỞI TẠO RESERVED_STOCK = 0
    });
    

    // Convert string boolean to actual boolean
    const productData = { ...req.body };
    if (productData.sale === 'true') productData.sale = true;
    if (productData.sale === 'false') productData.sale = false;

    const product = await ProductService.create({ ...productData, img_url: req.file ? `/uploads/${req.file.filename}` : '' });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });


    const products = await ProductService.update(req.params.id, { 
      ...req.body, 
      img_url: req.file ? `/uploads/${req.file.filename}` : req.body.img_url 
    });
    

    // Convert string boolean to actual boolean
    const productData = { ...req.body };
    if (productData.sale === 'true') productData.sale = true;
    if (productData.sale === 'false') productData.sale = false;

    const product = await ProductService.update(req.params.id, { ...productData, img_url: req.file ? `/uploads/${req.file.filename}` : req.body.img_url });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await ProductService.delete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query, minPrice, maxPrice, sort } = req.query;
    const filters = {};
    if (query) filters.name = new RegExp(query, 'i');
    if (minPrice || maxPrice) filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);

    console.log("Filters:", filters);

    let queryObj = ProductService.getAll(filters);

    if (sort === 'price_asc') queryObj = queryObj.sort({ price: 1 });
    else if (sort === 'price_desc') queryObj = queryObj.sort({ price: -1 });

    const products = await queryObj;
    console.log("Found:", products.length, "products");

    // ✅ THÊM THÔNG TIN AVAILABLE_STOCK CHO KẾT QUẢ TÌM KIẾM
    const productsWithAvailableStock = products.map(product => {
      const availableStock = product.stock - (product.reserved_stock || 0);
      return {
        ...product._doc,
        available_stock: availableStock,
        is_available: availableStock > 0
      };
    });

    res.json(productsWithAvailableStock);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message || 'Error searching products' });
  }
};

// ✅ THÊM API MỚI: Kiểm tra stock có thể đặt hàng
exports.checkAvailability = async (req, res) => {
  try {
    const { items } = req.body; // Array of { product_id, quantity }
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }
    
    const availabilityResults = [];
    let allAvailable = true;
    
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        availabilityResults.push({
          product_id: item.product_id,
          requested_quantity: item.quantity,
          available: false,
          reason: 'Product not found'
        });
        allAvailable = false;
        continue;
      }
      
      const canReserve = product.canReserve(item.quantity);
      const availableStock = product.stock - (product.reserved_stock || 0);
      
      availabilityResults.push({
        product_id: item.product_id,
        product_name: product.name,
        requested_quantity: item.quantity,
        available_stock: availableStock,
        total_stock: product.stock,
        reserved_stock: product.reserved_stock || 0,
        available: canReserve,
        reason: canReserve ? 'Available' : `Not enough stock. Available: ${availableStock}, Requested: ${item.quantity}`
      });
      
      if (!canReserve) {
        allAvailable = false;
      }
    }
    
    res.json({
      all_available: allAvailable,
      results: availabilityResults
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({ message: error.message || 'Error checking availability' });
  }
};

// ✅ THÊM API MỚI: Lấy thông tin inventory chi tiết
exports.getInventoryInfo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const availableStock = product.stock - (product.reserved_stock || 0);
    
    res.json({
      product_id: product._id,
      product_name: product.name,
      total_stock: product.stock,
      reserved_stock: product.reserved_stock || 0,
      available_stock: availableStock,
      is_available: availableStock > 0,
      updated_at: product.updated_at
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching inventory info' });
  }
};