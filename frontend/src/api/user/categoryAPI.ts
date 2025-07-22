import axios from 'axios';

// Kiểu dữ liệu danh mục
export interface Category {
  _id: string;
  slug: string;
  name: string;
  img_url?: string;
  parent?: string; // ObjectId (dưới dạng string)
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách tất cả danh mục
export const fetchAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get('http://localhost:5000/api/categories');
  return response.data;
};
