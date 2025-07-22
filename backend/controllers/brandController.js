const BrandService = require('../services/brandService');
const Joi = require('joi');

const brandSchema = Joi.object({
  slug: Joi.string().required(),
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

exports.getBrandById = async (req, res) => {
  try {
    const brand = await BrandService.getById(req.params.id);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching brand' });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { error } = brandSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let logoData = '';
    
    // Nếu có file upload, chuyển đổi thành base64
    if (req.file) {
      const buffer = req.file.buffer;
      const base64 = buffer.toString('base64');
      const mimeType = req.file.mimetype;
      logoData = `data:${mimeType};base64,${base64}`;
    }

    const brand = await BrandService.create({
      ...req.body,
      logo_data: logoData,
      logo_url: req.body.logo_url || ''
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating brand' });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { error } = brandSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let logoData = req.body.logo_data || '';
    
    // Nếu có file upload mới, chuyển đổi thành base64
    if (req.file) {
      const buffer = req.file.buffer;
      const base64 = buffer.toString('base64');
      const mimeType = req.file.mimetype;
      logoData = `data:${mimeType};base64,${base64}`;
    }

    const brand = await BrandService.update(req.params.id, {
      ...req.body,
      logo_data: logoData
    });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating brand' });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    await BrandService.delete(req.params.id);
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting brand' });
  }
};
