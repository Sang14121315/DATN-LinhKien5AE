const Joi = require('joi');
const productTypeService = require('../services/productTypeService');
const ProductType = require('../models/ProductType');
const Category = require('../models/Category');

// Joi Schema
const productTypeSchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
});

exports.getProductTypes = async (req, res) => {
  try {
    const types = await productTypeService.getAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách loại sản phẩm' });
  }
};

// Thêm hàm mới để lấy ProductTypes kèm Categories
exports.getProductTypesWithCategories = async (req, res) => {
  try {
    const productTypes = await ProductType.find().lean();
    
    const result = await Promise.all(
      productTypes.map(async (type) => {
        const categories = await Category.find({ 
          productType: type._id 
        }).select('_id name slug');
        
        return {
          ...type,
          categories
        };
      })
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

exports.getProductTypeById = async (req, res) => {
  try {
    const type = await productTypeService.getById(req.params.id);
    if (!type) return res.status(404).json({ error: 'Không tìm thấy loại sản phẩm' });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy loại sản phẩm' });
  }
};

exports.createProductType = async (req, res) => {
  try {
    const { error } = productTypeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newType = await productTypeService.create(req.body);
    res.status(201).json(newType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProductType = async (req, res) => {
  try {
    const { error } = productTypeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updated = await productTypeService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProductType = async (req, res) => {
  try {
    await productTypeService.delete(req.params.id);
    res.json({ message: 'Đã xóa loại sản phẩm' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};