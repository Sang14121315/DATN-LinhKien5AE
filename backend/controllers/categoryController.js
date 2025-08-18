const CategoryService = require('../services/categoryService');
const Joi = require('joi');

// Schema cho parent category (không có parent field)
const parentCategorySchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
});

// Schema cho child category (có parent field bắt buộc)
const childCategorySchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  parent: Joi.string().required(), // parent category ID bắt buộc
});

// Lấy parent categories (danh mục cha)
const getParentCategories = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.query;
    const filters = { parent: null }; // Chỉ lấy parent categories

    if (name) filters.name = new RegExp(name, 'i');
    
    if (startDate || endDate) filters.created_at = {};
    if (startDate) filters.created_at.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) filters.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');

    const categories = await CategoryService.getAll(filters);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching parent categories' });
  }
};

// Lấy child categories (danh mục con)
const getChildCategories = async (req, res) => {
  try {
    const { name, parent, startDate, endDate } = req.query;
    const filters = { parent: { $ne: null } }; // Chỉ lấy child categories

    if (name) filters.name = new RegExp(name, 'i');
    if (parent) filters.parent = parent;
    
    if (startDate || endDate) filters.created_at = {};
    if (startDate) filters.created_at.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) filters.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');

    const categories = await CategoryService.getAll(filters);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching child categories' });
  }
};

// Lấy child categories theo parent ID cụ thể
const getChildCategoriesByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    const childCategories = await CategoryService.getAll({ parent: parentId });
    res.json(childCategories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching child categories' });
  }
};

// Lấy cấu trúc hierarchical (parent + children)
const getCategoriesHierarchy = async (req, res) => {
  try {
    const parentCategories = await CategoryService.getAllWithChildren();
    res.json(parentCategories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching categories hierarchy' });
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

// Tạo parent category
const createParentCategory = async (req, res) => {
  try {
    const { error } = parentCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const categoryData = { ...req.body, parent: null }; // Đảm bảo parent = null
    const category = await CategoryService.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating parent category' });
  }
};

// Tạo child category
const createChildCategory = async (req, res) => {
  try {
    const { error } = childCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await CategoryService.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating child category' });
  }
};

// Cập nhật parent category
const updateParentCategory = async (req, res) => {
  try {
    const { error } = parentCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const categoryData = { ...req.body, parent: null }; // Đảm bảo parent = null
    const category = await CategoryService.update(req.params.id, categoryData);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating parent category' });
  }
};

// Cập nhật child category
const updateChildCategory = async (req, res) => {
  try {
    const { error } = childCategorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const category = await CategoryService.update(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating child category' });
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
      name: cat.name,
      parent: cat.parent
    }));
    res.json(names);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category names' });
  }
};

module.exports = {
  getParentCategories,
  getChildCategories,
  getChildCategoriesByParentId,
  getCategoriesHierarchy,
  getCategoryById,
  createParentCategory,
  createChildCategory,
  updateParentCategory,
  updateChildCategory,
  deleteCategory,
  getCategoryNames
};