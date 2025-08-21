const Category = require('../models/Category');

class CategoryService {
  static async getAll(filters = {}) {
    return await Category.find(filters)
      .populate('parent', 'name slug');
  }

  // Lấy tất cả parent categories kèm children
  static async getAllWithChildren() {
    const parentCategories = await Category.find({ parent: null })
      .populate('parent', 'name slug');
    
    const result = await Promise.all(
      parentCategories.map(async (parent) => {
        const children = await Category.find({ parent: parent._id })
          .select('_id name slug description created_at');
        
        return {
          ...parent.toObject(),
          children
        };
      })
    );
    
    return result;
  }

  // Lấy parent categories (danh mục cha)
  static async getParentCategories(filters = {}) {
    const parentFilters = { ...filters, parent: null };
    return await Category.find(parentFilters);
  }

  // Lấy child categories (danh mục con)
  static async getChildCategories(filters = {}) {
    const childFilters = { ...filters, parent: { $ne: null } };
    return await Category.find(childFilters)
      .populate('parent', 'name slug');
  }

  // Lấy child categories theo parent ID
  static async getChildCategoriesByParent(parentId) {
    return await Category.find({ parent: parentId })
      .populate('parent', 'name slug');
  }

  static async getById(id) {
    const category = await Category.findById(id)
      .populate('parent', 'name slug');
    if (!category) throw new Error('Category not found');
    return category;
  }

  // Tạo parent category
  static async createParentCategory(data) {
    const categoryData = { ...data, parent: null };
    return await Category.create(categoryData);
  }

  // Tạo child category
  static async createChildCategory(data) {
    // Validate parent exists
    if (!data.parent) throw new Error('Parent category is required for child category');
    
    const parentExists = await Category.findById(data.parent);
    if (!parentExists) throw new Error('Parent category not found');
    
    // Đảm bảo parent không phải là child category
    if (parentExists.parent !== null) {
      throw new Error('Cannot create child category under another child category');
    }
    
    return await Category.create(data);
  }

  static async create(data) {
    // Validate parent exists if provided
    if (data.parent && data.parent !== '') {
      const parentExists = await Category.findById(data.parent);
      if (!parentExists) throw new Error('Parent category not found');
    }
    return await Category.create(data);
  }

  static async update(id, data) {
    // Validate parent exists if provided
    if (data.parent && data.parent !== '') {
      const parentExists = await Category.findById(data.parent);
      if (!parentExists) throw new Error('Parent category not found');
    }
    
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error('Category not found');
    return category;
  }

  static async delete(id) {
    // Check if category has children
    const hasChildren = await Category.findOne({ parent: id });
    if (hasChildren) throw new Error('Cannot delete category that has child categories');
    
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error('Category not found');
    return true;
  }
}

module.exports = CategoryService;