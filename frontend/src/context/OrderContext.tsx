import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrder, getOrders, cancelOrderAPI } from '@/api/orderAPI';

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

interface Order {
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
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
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
      await cancelOrderAPI(id, { status: 'cancelled' });
      setOrders(prev =>
        prev.map(order =>
          order._id === id ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (err) {
      console.error("❌ Huỷ đơn thất bại:", err);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
