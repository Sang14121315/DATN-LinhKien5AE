import axios from 'axios';

// Kiểu dữ liệu danh mục
export interface Category {
  _id: string;
  slug: string;
  name: string;
  img_url?: string;
  parent?: string; // ObjectId (dưới dạng string)
  productType?: string; // ObjectId (dưới dạng string)
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách tất cả danh mục
export const fetchAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get('http://localhost:5000/api/categories');
  return response.data;
};

// Lấy danh mục theo loại sản phẩm
export const fetchCategoriesByProductType = async (productTypeId: string): Promise<Category[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/categories/by-product-type/${productTypeId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh mục theo loại sản phẩm ${productTypeId}:`, error);
    throw error;
  }
};