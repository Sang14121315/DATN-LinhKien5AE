const CategoryService = require('../services/categoryService');
const Joi = require('joi');

// Schema cho category (có thể là parent hoặc child)
const categorySchema = Joi.object({
  slug: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  parent: Joi.string().allow(null, ''), // parent có thể null (parent category) hoặc có giá trị (child category)
});

// Lấy tất cả categories với structure cây
const getCategories = async (req, res) => {
  try {
    const { name, startDate, endDate, parent } = req.query;
    const filters = {};

    if (name) filters.name = new RegExp(name, 'i');
    if (parent !== undefined) {
      if (parent === 'null' || parent === '') {
        filters.parent = null; // Lấy parent categories
      } else {
        filters.parent = parent; // Lấy child categories của parent cụ thể
      }
    }
    
    if (startDate || endDate) filters.created_at = {};
    if (startDate) filters.created_at.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) filters.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');

    const categories = await CategoryService.getAll(filters);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

// Lấy cấu trúc hierarchical (parent + children) - dùng cho tree view
const getCategoriesHierarchy = async (req, res) => {
  try {
    const parentCategories = await CategoryService.getAllWithChildren();
    res.json(parentCategories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching categories hierarchy' });
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

const getCategoryById = async (req, res) => {
  try {
    const category = await CategoryService.getById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching category' });
  }
};

// Tạo category (có thể là parent hoặc child tùy vào parent field)
const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Xử lý parent field
    let categoryData = { ...req.body };
    if (!categoryData.parent || categoryData.parent === '') {
      categoryData.parent = null; // Tạo parent category
    }

    const category = await CategoryService.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating category' });
  }
};

// Cập nhật category
const updateCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Xử lý parent field
    let categoryData = { ...req.body };
    if (!categoryData.parent || categoryData.parent === '') {
      categoryData.parent = null; // Chuyển thành parent category
    }

    const category = await CategoryService.update(req.params.id, categoryData);
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
      name: cat.name,
      parent: cat.parent
    }));
    res.json(names);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category names' });
  }
};

// Lấy danh sách parent categories để làm dropdown
const getParentCategoriesForDropdown = async (req, res) => {
  try {
    const parentCategories = await CategoryService.getAll({ parent: null });
    res.json(parentCategories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching parent categories' });
  }
};

module.exports = {
  getCategories,
  getCategoriesHierarchy,
  getChildCategoriesByParentId,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryNames,
  getParentCategoriesForDropdown
};