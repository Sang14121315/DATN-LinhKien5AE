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

export interface RevenueOrderByDate {
  date: string;
  revenue: number;
  orders: number;
}

export const fetchRevenueOrdersByDate = async (from?: string, to?: string): Promise<RevenueOrderByDate[]> => {
  const params: any = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await axios.get('http://localhost:5000/api/admin/dashboard/revenue-orders-by-date', {
    params,
    withCredentials: true,
  });
  return response.data;
};

export interface TopProduct {
  product_id: string;
  name: string;
  sold: number;
}

export const fetchTop5BestSellerProducts = async (): Promise<TopProduct[]> => {
  const response = await axios.get('http://localhost:5000/api/admin/dashboard/top5-bestseller-products', {
    withCredentials: true,
  });
  return response.data;
};

// Review Management APIs
export const getAllReviews = async () => {
  const response = await axios.get('http://localhost:5000/api/admin/reviews', {
    withCredentials: true,
  });
  return response.data;
};

export const adminReplyToReview = async (reviewId: string, reply: string) => {
  const response = await axios.put(`http://localhost:5000/api/admin/reviews/${reviewId}/reply`, { reply }, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await axios.delete(`http://localhost:5000/api/admin/reviews/${reviewId}`, {
    withCredentials: true,
  });
  return response.data;
};