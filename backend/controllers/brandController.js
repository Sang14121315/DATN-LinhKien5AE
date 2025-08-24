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

    // Lấy thương hiệu hiện tại từ cơ sở dữ liệu
    const currentBrand = await BrandService.getById(req.params.id);
    if (!currentBrand) {
      return res.status(404).json({ message: 'Không tìm thấy thương hiệu' });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      ...req.body,
      slug,
      updated_at: new Date(), // Cập nhật thời gian
    };

    // Xử lý logo
    if (req.file) {
      // Nếu có file ảnh mới, cập nhật logo_url và xóa file cũ nếu tồn tại
      if (currentBrand.logo_url && currentBrand.logo_url.startsWith('/uploads/')) {
        const fs = require('fs').promises;
        const path = require('path');
        const oldFilePath = path.join(__dirname, '..', currentBrand.logo_url);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.warn('Không thể xóa file cũ:', err);
        }
      }
      updateData.logo_url = `/uploads/${req.file.filename}`;
      updateData.logo_data = ''; // Xóa logo_data
    } else if (req.body.logo_data) {
      // Nếu có logo_data từ frontend, cập nhật logo_data
      updateData.logo_data = req.body.logo_data;
      updateData.logo_url = ''; // Xóa logo_url
    } else if (req.body.logo_url) {
      // Nếu có logo_url từ frontend, cập nhật logo_url
      updateData.logo_url = req.body.logo_url;
      updateData.logo_data = ''; // Xóa logo_data
    } else {
      // Giữ nguyên logo hiện tại
      updateData.logo_url = currentBrand.logo_url;
      updateData.logo_data = currentBrand.logo_data;
    }

    const brand = await BrandService.update(req.params.id, updateData);
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