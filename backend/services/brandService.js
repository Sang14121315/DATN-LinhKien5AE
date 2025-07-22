const Brand = require('../models/Brand');

class BrandService {
  static async getAll(filters = {}) {
    return await Brand.find(filters);
  }

  static async getById(id) {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error('Brand not found');
    return brand;
  }

  static async create(data) {
    return await Brand.create(data);
  }

  static async update(id, data) {
    const brand = await Brand.findByIdAndUpdate(id, data, { new: true });
    if (!brand) throw new Error('Brand not found');
    return brand;
  }

  static async delete(id) {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new Error('Brand not found');
    return true;
  }
}

module.exports = BrandService;