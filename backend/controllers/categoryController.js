const CategoryService = require('../services/categoryService');
const Joi = require('joi');

const categorySchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  parent: Joi.string().allow(null, ''),
  productType: Joi.string().length(24).required() // validate productType là ObjectId
});

const getCategories = async (req, res) => {
  try {
    const { name, parent, startDate, endDate } = req.query;
    const filters = {};

    if (name) filters.name = new RegExp(name, 'i');
    if (parent) filters.parent = parent === 'null' ? null : parent;
    if (startDate || endDate) filters.created_at = {};
    if (startDate) filters.created_at.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) filters.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');

    const categories = await CategoryService.getAll(filters);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

const getCategoriesByProductType = async (req, res) => {
  try {
    const { productTypeId } = req.params;
    const categories = await CategoryService.getAll({ productType: productTypeId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching categories by product type' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await CategoryService.getById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await CategoryService.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await CategoryService.update(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await CategoryService.delete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting category' });
  }
};

const getCategoryNames = async (req, res) => {
  try {
    const categories = await CategoryService.getAll();
    const names = categories.map(cat => ({
      _id: cat._id,
      name: cat.name
    }));
    res.json(names);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category names' });
  }
};

module.exports = {
  getCategories,
  getCategoriesByProductType,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames
};