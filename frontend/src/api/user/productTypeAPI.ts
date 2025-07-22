import axios from 'axios';

// Kiểu dữ liệu ProductType
export interface ProductType {
  _id: string;
  slug: string;
  name: string;
  category_id: string; // ObjectId (dưới dạng string)
  created_at?: string;
  updated_at?: string;
}

// API: Lấy danh sách tất cả loại sản phẩm
export const fetchAllProductTypes = async (): Promise<ProductType[]> => {
  const response = await axios.get('http://localhost:5000/api/product-types');
  return response.data;
};

// (Tuỳ chọn) API: Lấy các loại sản phẩm theo category
export const fetchProductTypesByCategory = async (categoryId: string): Promise<ProductType[]> => {
  const response = await axios.get(`http://localhost:5000/api/product-types?category_id=${categoryId}`);
  return response.data;
};
