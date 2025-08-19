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
  children?: Category[];
}

// Tạo instance axios với baseURL
const adminApi = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

// Thêm token vào header của mọi yêu cầu
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 (chuyển hướng đến đăng nhập)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Không có quyền truy cập - Chuyển hướng đến trang đăng nhập");
      localStorage.removeItem("token"); // Xóa token hết hạn
      window.location.href = "/login"; // Điều chỉnh nếu đường dẫn login khác
    }
    return Promise.reject(error);
  }
);

// Lấy tất cả categories với bộ lọc
export const fetchCategories = async (filters: {
  name?: string;
  parent?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<Category[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.name) params.append("name", filters.name);
    if (filters.parent !== undefined) params.append("parent", filters.parent);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await adminApi.get(`/categories?${params.toString()}`);
    console.log("Categories:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh mục:", error);
    throw new Error(error.response?.data?.message || "Không thể tải danh mục");
  }
};

// Lấy danh sách parent categories để làm dropdown
export const fetchParentCategoriesForDropdown = async (): Promise<Category[]> => {
  try {
    const response = await adminApi.get("/categories/parent-dropdown");
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh mục cha:", error);
    throw new Error(error.response?.data?.message || "Không thể tải danh mục cha");
  }
};

// Lấy child categories theo parent ID
export const fetchChildCategoriesByParent = async (parentId: string): Promise<Category[]> => {
  try {
    const response = await adminApi.get(`/categories/${parentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh mục con:", error);
    throw new Error(error.response?.data?.message || "Không thể tải danh mục con theo parent");
  }
};

// Lấy cấu trúc hierarchical (parent + children)
export const fetchCategoriesHierarchy = async (): Promise<Category[]> => {
  try {
    const response = await adminApi.get("/categories/hierarchy");
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy cấu trúc danh mục:", error);
    throw new Error(error.response?.data?.message || "Không thể tải cấu trúc danh mục");
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await adminApi.get(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi lấy danh mục theo ID:", error);
    throw new Error(error.response?.data?.message || "Không thể tải danh mục");
  }
};

// Tạo category (parent hoặc child tùy vào parent field)
export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
}): Promise<Category> => {
  try {
    const response = await adminApi.post("/categories", data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi tạo danh mục:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo danh mục");
  }
};

// Cập nhật category Ascending
export const updateCategory = async (
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    parent?: string | null;
  }
): Promise<Category> => {
  try {
    const response = await adminApi.put(`/categories/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật danh mục");
  }
};

// Xóa danh mục
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await adminApi.delete(`/categories/${id}`);
  } catch (error: any) {
    console.error("Lỗi khi xóa danh mục:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa danh mục");
  }
};