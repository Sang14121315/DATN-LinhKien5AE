import axios from 'axios';

export interface ProductType {
  _id: string;
  slug: string;
  name: string;
  category_id: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchAllProductTypes = async (): Promise<ProductType[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/product-types');
    return response.data;
  } catch (error) {
    console.error("Error fetching product types:", error);
    throw error;
  }
};

export const fetchProductTypesByCategory = async (categoryId: string): Promise<ProductType[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/product-types?category_id=${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product types for category ${categoryId}:`, error);
    throw error;
  }
};

// Hàm mới để lấy ProductTypes theo nhiều category
export const fetchProductTypesByCategories = async (categoryIds: string[]): Promise<Record<string, ProductType[]>> => {
  try {
    const responses = await Promise.all(
      categoryIds.map(id => 
        axios.get(`http://localhost:5000/api/product-types?category_id=${id}`)
      )
    );
    
    const result: Record<string, ProductType[]> = {};
    categoryIds.forEach((id, index) => {
      result[id] = responses[index].data;
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching product types by categories:", error);
    throw error;
  }
};