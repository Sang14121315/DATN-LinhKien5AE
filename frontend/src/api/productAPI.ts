import axios from './axios';

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  img_url?: string;
  category_id: { _id: string; name: string } | string;
  brand_id: { _id: string; name: string } | string;
  product_type_id: { _id: string; name: string } | string;
  sale?: number;
  hot?: boolean;
  view?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  totalPages: number;
}

export interface ProductQueryParams {
  name?: string;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  minPrice?: number;
  maxPrice?: number;
  sale?: boolean;
  hot?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'view_desc';
  page?: number;
  limit?: number;
}

// ✅ Lấy tất cả sản phẩm với bộ lọc
export const fetchAllProducts = async (
  filters: ProductQueryParams = {}
): Promise<ProductListResponse> => {
  try {
    const params = new URLSearchParams();

    const mergedFilters = {
      ...filters,
      limit: filters.limit ?? 1000,
      page: filters.page ?? 1, 
    };

    Object.entries(mergedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error);
    throw new Error('Không thể tải danh sách sản phẩm');
  }
};

// ✅ Lấy chi tiết 1 sản phẩm
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    throw new Error('Không thể tải chi tiết sản phẩm');
  }
};

// ✅ Tạo mới sản phẩm (gửi FormData)
export const createProduct = async (data: FormData): Promise<Product> => {
  try {
    const response = await axios.post('http://localhost:5000/api/products', data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    throw new Error('Không thể tạo sản phẩm');
  }
};

// ✅ Cập nhật sản phẩm
export const updateProduct = async (id: string, data: FormData): Promise<Product> => {
  try {
    const response = await axios.put(
      `http://localhost:5000/api/products/${id}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data' // KHÔNG đặt nếu axios tự detect
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error?.response?.data || error);
    throw new Error(error?.response?.data?.message || 'Không thể cập nhật sản phẩm');
  }
};


// ✅ Xoá sản phẩm
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await axios.delete(`http://localhost:5000/api/products/${id}`);
  } catch (error) {
    console.error('Lỗi khi xoá sản phẩm:', error);
    throw new Error('Không thể xoá sản phẩm');
  }
};

// ✅ Format tiền VND
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
