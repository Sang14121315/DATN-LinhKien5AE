import axios from 'axios';

export interface DashboardStats {
  totalOrders: number;
  totalDelivered: number;
  totalCanceled: number;
  totalPending: number;
  totalRevenue: number;
}

export interface DashboardOrder {
  _id: string;
  product: string;
  orderNumber: string;
  date: string;
  customer: string;
  status: string;
  amount: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
    withCredentials: true, // Sử dụng cookie thay vì Authorization header
  });
  
  console.log('Stats response:', response.data);
  return {
    totalOrders: response.data.totalOrders,
    totalDelivered: response.data.totalDelivered,
    totalCanceled: response.data.totalCanceled,
    totalPending: response.data.totalPending,
    totalRevenue: response.data.totalRevenue
  };
};

export const fetchRecentOrders = async (): Promise<DashboardOrder[]> => {
  const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
    withCredentials: true, // Sử dụng cookie thay vì Authorization header
  });
  
  console.log('Orders response:', response.data);
  return response.data.orders || [];
};

export const formatCurrency = (value: number): string => {
  return `${value.toLocaleString()} VNĐ`;
};