import axios from 'axios';
import { Product } from './productAPI';
import { Category } from './categoryAPI';

export interface HomeData {
  saleProducts: Product[];
  hotProducts: Product[];
  bestSellerProducts: Product[];
  categories: Category[];
}

export const fetchHomeData = async (): Promise<HomeData> => {
  const response = await axios.get('http://localhost:5000/api/home');
  return response.data;
};