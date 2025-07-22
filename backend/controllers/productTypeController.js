const Joi = require('joi');
const productTypeService = require('../services/productTypeService');

// Joi Schema
const productTypeSchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  category_id: Joi.string().length(24).required(),
});

exports.getProductTypes = async (req, res) => {
  try {
    const types = await productTypeService.getAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách loại sản phẩm' });
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
