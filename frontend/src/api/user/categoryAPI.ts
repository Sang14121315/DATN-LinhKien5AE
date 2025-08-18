import axios from 'axios';

export interface Category {
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  parent?: string | { _id: string; name: string; slug: string } | null;
  img_url?: string;
  created_at?: string;
  updated_at?: string;
  children?: Category[]; // For hierarchy view
}

// Lấy tất cả parent categories với bộ lọc
export const fetchParentCategories = async (filters: {
  name?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<Category[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`http://localhost:5000/api/categories?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    throw new Error('Không thể tải danh mục cha');
  }
};

// Lấy tất cả child categories với bộ lọc
export const fetchChildCategories = async (filters: {
  name?: string;
  parent?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<Category[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.parent) params.append('parent', filters.parent);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`http://localhost:5000/api/child-categories?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child categories:', error);
    throw new Error('Không thể tải danh mục con');
  }
};

// Lấy cấu trúc hierarchical (parent + children)
export const fetchCategoriesHierarchy = async (): Promise<Category[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/categories/hierarchy');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories hierarchy:', error);
    throw new Error('Không thể tải cấu trúc danh mục');
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