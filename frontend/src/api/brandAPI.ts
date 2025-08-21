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
export const createBrand = async (data: FormData): Promise<Brand> => {
  try {
    const name = data.get('name')?.toString()?.trim();
    if (!name) {
      throw new Error('Tên thương hiệu là bắt buộc');
    }

    const slug = data.get('slug')?.toString()?.trim() || name.toLowerCase().replace(/\s+/g, '-');
    data.set('slug', slug); // Cập nhật slug trong FormData

    console.log('FormData before sending:', { name, slug, logoFile: data.get('logoFile') }); // Debug

    const response = await axiosInstance.post('/admin/brands', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating brand:', error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || 'Không thể tạo thương hiệu');
  }
};

// ✅ Cập nhật thương hiệu
export const updateBrand = async (id: string, data: FormData): Promise<Brand> => {
  try {
    const name = data.get('name')?.toString()?.trim();
    if (!name) {
      throw new Error('Tên thương hiệu là bắt buộc');
    }

    const slug = data.get('slug')?.toString()?.trim() || name.toLowerCase().replace(/\s+/g, '-');
    data.set('slug', slug); // Cập nhật slug trong FormData

    console.log('FormData before sending:', { name, slug, logoFile: data.get('logoFile') }); // Debug

    const response = await axiosInstance.put(`/admin/brands/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating brand:', error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || 'Không thể cập nhật thương hiệu');
  }
};

// ✅ Xóa thương hiệu
export const deleteBrand = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/brands/${id}`);
};