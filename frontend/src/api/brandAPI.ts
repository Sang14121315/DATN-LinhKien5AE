import axiosInstance from './axios';

export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo_data?: string; // Base64 image data
  logo_url?: string;
  parent?: string | { _id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

// ✅ Lấy tất cả thương hiệu với bộ lọc
export const fetchAllBrands = async (filters: {
  name?: string;
  parent?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<Brand[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    if (filters.parent) params.append('parent', filters.parent);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const url = `/admin/brands?${params.toString()}`;
    const response = await axiosInstance.get(url);
    console.log('API Response:', response.data); // Debug dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw new Error('Không thể tải thương hiệu');
  }
};

// ✅ Lấy 1 thương hiệu theo ID
export const getBrandById = async (id: string): Promise<Brand> => {
  const response = await axiosInstance.get(`/admin/brands/${id}`);
  return response.data;
};

// ✅ Tạo mới thương hiệu
export const createBrand = async (data: Partial<Brand> & { logoFile?: File }): Promise<Brand> => {
  if (data.logoFile) {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('slug', data.slug || '');
    formData.append('logoFile', data.logoFile);
    const response = await axiosInstance.post('/admin/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } else {
    const response = await axiosInstance.post('/admin/brands', data);
    return response.data;
  }
};

// ✅ Cập nhật thương hiệu
export const updateBrand = async (id: string, data: Partial<Brand> & { logoFile?: File }): Promise<Brand> => {
  if (data.logoFile) {
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('slug', data.slug || '');
    formData.append('logoFile', data.logoFile);
    const response = await axiosInstance.put(`/admin/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } else {
    const response = await axiosInstance.put(`/admin/brands/${id}`, data);
    return response.data;
  }
};

// ✅ Xóa thương hiệu
export const deleteBrand = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/brands/${id}`);
};
