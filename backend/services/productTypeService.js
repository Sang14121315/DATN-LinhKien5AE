const ProductType = require('../models/ProductType');

exports.getAll = async () => {
  return await ProductType.find().populate('category_id');
};

exports.getById = async (id) => {
  return await ProductType.findById(id).populate('category_id');
};

exports.create = async (data) => {
  const exists = await ProductType.findOne({ slug: data.slug });
  if (exists) throw new Error('Slug đã tồn tại');

  const newType = new ProductType(data);
  return await newType.save();
};

exports.update = async (id, data) => {
  const updated = await ProductType.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error('Không tìm thấy loại sản phẩm');
  return updated;
};

exports.delete = async (id) => {
  const deleted = await ProductType.findByIdAndDelete(id);
  if (!deleted) throw new Error('Không tìm thấy loại sản phẩm');
  return deleted;
};
