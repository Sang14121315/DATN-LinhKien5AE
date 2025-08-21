const BrandService = require('../services/brandService');
const Joi = require('joi');

const brandSchema = Joi.object({
  slug: Joi.string().allow(''), // Cho phép slug rỗng, sẽ xử lý trong logic
  name: Joi.string().required(),
  logo_data: Joi.string().allow(''),
  logo_url: Joi.string().allow(''),
  parent: Joi.string().allow(null, ''),
});

// ✅ Lấy danh sách brand có hỗ trợ filter
exports.getBrands = async (req, res) => {
  try {
    const { name, parent, startDate, endDate } = req.query;
    const filters = {};

    if (name) filters.name = new RegExp(name, 'i');
    if (parent) filters.parent = parent === 'null' ? null : parent;

    if (startDate || endDate) {
      filters.created_at = {};
      if (startDate) filters.created_at.$gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) filters.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const brands = await BrandService.getAll(filters);
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching brands' });
  }
};

// ✅ Lấy brand theo ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await BrandService.getById(req.params.id);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching brand' });
  }
};

// ✅ Tạo mới thương hiệu
exports.createBrand = async (req, res) => {
  try {
    const { error } = brandSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Tạo slug từ name nếu slug rỗng
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-');

    // Xử lý logo
    let logoUrl = '';
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const brand = await BrandService.create({
      ...req.body,
      slug,
      logo_url: logoUrl,
      logo_data: '',
    });
    res.status(201).json(brand);
  } catch (error) {
    console.error('Lỗi tạo thương hiệu:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi tạo thương hiệu' });
  }
};

// ✅ Cập nhật thương hiệu
exports.updateBrand = async (req, res) => {
  try {
    const { error } = brandSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Tạo slug từ name nếu slug rỗng
    const slug = req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-');

    // Xử lý logo
    let logoUrl = req.body.logo_url || '';
    if (req.file) {
      logoUrl = `/uploads/${req.file.filename}`;
    }

    const brand = await BrandService.update(req.params.id, {
      ...req.body,
      slug,
      logo_url: logoUrl,
      logo_data: '',
    });
    if (!brand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }
    res.json(brand);
  } catch (error) {
    console.error('Lỗi cập nhật thương hiệu:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi cập nhật thương hiệu' });
  }
};

// ✅ Xóa thương hiệu
exports.deleteBrand = async (req, res) => {
  try {
    await BrandService.delete(req.params.id);
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting brand' });
  }
};