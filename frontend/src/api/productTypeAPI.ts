import axiosInstance from './axios';

export interface ProductType {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// ✅ Lấy danh sách loại sản phẩm với bộ lọc
export const fetchAllProductTypes = async (
  params: Record<string, string | number | boolean> = {}
): Promise<ProductType[]> => {
  try {
    const res = await axiosInstance.get('/product-types', { params });
    console.log('Product types response:', res.data);
    return res.data || [];
  } catch (err) {
    console.error('Lỗi lấy danh sách loại sản phẩm:', err);
    return [];
  }
};

// ✅ Lấy loại sản phẩm theo ID
export const getProductTypeById = async (id: string): Promise<ProductType> => {
  const res = await axiosInstance.get(`/product-types/${id}`);
  return res.data;
};

// ✅ Tạo loại sản phẩm mới
export const createProductType = async (data: Partial<ProductType>) => {
  const res = await axiosInstance.post('/product-types', data);
  return res.data;
};

// ✅ Cập nhật loại sản phẩm
export const updateProductType = async (id: string, data: Partial<ProductType>) => {
  const res = await axiosInstance.put(`/product-types/${id}`, data);
  return res.data;
};

// ✅ Xoá loại sản phẩm
export const deleteProductType = async (id: string) => {
  const res = await axiosInstance.delete(`/product-types/${id}`);
  return res.data.message;
};

// ✅ Alias để tương thích với code cũ
export const fetchProductTypes = fetchAllProductTypes;
