import axios from 'axios';

// Kiểu dữ liệu thương hiệu
export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Lấy danh sách tất cả thương hiệu
export const fetchAllBrands = async (): Promise<Brand[]> => {
  const response = await axios.get('http://localhost:5000/api/brands');
  return response.data;
};
