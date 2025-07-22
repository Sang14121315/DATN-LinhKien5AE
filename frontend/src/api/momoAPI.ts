import axiosInstance from './axios';

export const createMomoOrder = async (orderData: any) => {
  const res = await axiosInstance.post(`/momo/create`, orderData);
  return res.data;
}; 