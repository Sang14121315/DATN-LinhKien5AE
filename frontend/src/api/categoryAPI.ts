import axios from "axios";

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
    console.log('Parent categories:', response.data);
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
    console.log('Child categories:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching child categories:', error);
    throw new Error('Không thể tải danh mục con');
  }
};

// Thêm lại fetchAllCategories như wrapper cho fetchChildCategories (giả sử dùng cho product cần all child)
export const fetchAllCategories = async (filters: {
  name?: string;
  parent?: string;
  startDate?: string;
  endDate?: string;
  isParent?: string; // Giữ tương thích cũ nếu cần, nhưng ignore vì tách riêng
} = {}): Promise<Category[]> => {
  console.warn('fetchAllCategories is deprecated; use fetchChildCategories or fetchParentCategories instead.');
  return await fetchChildCategories(filters); // Hoặc fetchParentCategories nếu product attach parent
};

// Lấy child categories theo parent ID
export const fetchChildCategoriesByParent = async (parentId: string): Promise<Category[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/child-categories/parent/${parentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child categories by parent:', error);
    throw new Error('Không thể tải danh mục con theo parent');
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

// Lấy danh mục theo ID (có thể dùng cho cả parent và child)
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    throw new Error('Không thể tải danh mục');
  }
};

// Tạo parent category
export const createParentCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Category> => {
  try {
    const response = await axios.post("http://localhost:5000/api/categories", data);
    return response.data;
  } catch (error) {
    console.error('Error creating parent category:', error);
    throw new Error('Không thể tạo danh mục cha');
  }
};

// Tạo child category
export const createChildCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  parent: string;
}): Promise<Category> => {
  try {
    const response = await axios.post("http://localhost:5000/api/child-categories", data);
    return response.data;
  } catch (error) {
    console.error('Error creating child category:', error);
    throw new Error('Không thể tạo danh mục con');
  }
};

// Cập nhật parent category
export const updateParentCategory = async (id: string, data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Category> => {
  try {
    const response = await axios.put(`http://localhost:5000/api/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating parent category:', error);
    throw new Error('Không thể cập nhật danh mục cha');
  }
};

// Cập nhật child category
export const updateChildCategory = async (id: string, data: {
  name: string;
  slug: string;
  description?: string;
  parent: string;
}): Promise<Category> => {
  try {
    const response = await axios.put(`http://localhost:5000/api/child-categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating child category:', error);
    throw new Error('Không thể cập nhật danh mục con');
  }
};

// Xóa danh mục (có thể dùng cho cả parent và child, tùy route)
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Không thể xóa danh mục');
  }
};