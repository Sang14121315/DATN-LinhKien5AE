import axios from "axios";

export interface Category {
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  parent?: string | { _id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

// Lấy tất cả danh mục với bộ lọc
export const fetchAllCategories = async (filters: {
  name?: string;
  parent?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Category[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.parent) params.append('parent', filters.parent);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`http://localhost:5000/api/categories?${params.toString()}`);
    console.log('API Response:', response.data); // Debug dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Không thể tải danh mục');
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw new Error('Không thể tải danh mục');
  }
};

// Tạo mới danh mục
export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  try {
    const response = await axios.post("http://localhost:5000/api/categories", data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Không thể tạo danh mục');
  }
};

// Cập nhật danh mục
export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  try {
    const response = await axios.put(`http://localhost:5000/api/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Không thể cập nhật danh mục');
  }
};

// Xóa danh mục
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Không thể xóa danh mục');
  }
};