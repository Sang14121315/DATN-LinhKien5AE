const ProductService = require('../services/productService');
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
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

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

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message || 'Error searching products' });
  }
};