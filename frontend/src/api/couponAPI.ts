// 📁 api/couponAPI.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchCoupons = async () => {
  const res = await axios.get(`${API_URL}/coupons`, { withCredentials: true });
  return res.data;
};

export const getCouponById = async (id: string) => {
  const res = await axios.get(`${API_URL}/coupons/${id}`);
  return res.data;
};

export const createCouponAPI = async (data: any) => {
  const res = await axios.post(`${API_URL}/coupons`, data, { withCredentials: true });
  return res.data;
};

export const updateCouponAPI = async (id: string, data: any) => {
  const res = await axios.put(`${API_URL}/coupons/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteCouponAPI = async (id: string) => {
  const res = await axios.delete(`${API_URL}/coupons/${id}`, { withCredentials: true });
  return res.data;
};
