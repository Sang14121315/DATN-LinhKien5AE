import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrder, getOrders, cancelOrderAPI, updateOrderStatus as updateOrderStatusAPI } from '@/api/orderAPI';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  img_url?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

interface OrderData {
  payment_method: string;
  total: number;
  city: string;
  district: string;
  ward: string;
  customer: CustomerInfo;
  items: OrderItem[];
}

export interface Order {
  _id: string;
  customer: CustomerInfo;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderContextType {
  orders: Order[];
  addOrder: (data: OrderData) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lắng nghe event logout để clear orders
  useEffect(() => {
    const handleLogout = (event: Event) => {
      console.log('📦 Clearing orders due to logout...');
      setOrders([]);
    };

    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng:', err);
    }
  };

  const addOrder = async (data: OrderData) => {
    const res = await createOrder(data);
    const fullOrder: Order = {
      ...res.order,
      items: res.orderDetails,
    };
    setOrders(prev => [fullOrder, ...prev]);
  };

  const cancelOrder = async (id: string) => {
    try {
      const orderToCancel = orders.find(order => order._id === id);
      if (!orderToCancel) throw new Error('Đơn hàng không tồn tại');
      if (orderToCancel.status === 'completed' || orderToCancel.status === 'canceled') {
        throw new Error('Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy trước đó');
      }
      await cancelOrderAPI(id);
      await fetchOrders(); // Refresh danh sách sau khi hủy
    } catch (err) {
      console.error("❌ Huỷ đơn thất bại:", err);
      throw err; // Ném lỗi để xử lý ở component gọi
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const orderToUpdate = orders.find(order => order._id === id);
      if (!orderToUpdate) throw new Error('Đơn hàng không tồn tại');
      if (status === 'canceled' && (orderToUpdate.status === 'completed' || orderToUpdate.status === 'canceled')) {
        throw new Error('Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy trước đó');
      }
      await updateOrderStatusAPI(id, status);
      await fetchOrders(); // Refresh danh sách sau khi cập nhật
    } catch (err) {
      console.error("❌ Cập nhật trạng thái thất bại:", err);
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, cancelOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};