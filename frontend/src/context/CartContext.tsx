import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCart,
  addToCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI
} from '@/api/user/cartAPI';
import { fetchProductById } from '@/api/user/productAPI';
import { useAuth } from './AuthContext';
import LoginNotification from '@/components/LoginNotification';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  sale?: number;
  img_url: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  isSidebarOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  increaseQuantity: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  forceClearCart: () => void;
  reloadCart: () => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const totalPrice = cartItems.reduce((total, item) => {
    const finalPrice = item.sale && item.sale > 0 ? item.price - item.sale : item.price;
    return total + finalPrice * item.quantity;
  }, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const loadCart = async () => {
    // Chỉ load cart khi đã đăng nhập
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      const data = await fetchCart();
      console.log('🛒 Cart data from server:', data);

      // ✅ Check nếu không có items thì log ra để debug
      if (!data || !Array.isArray(data.items)) {
        console.warn('Cart data không hợp lệ:', data);
        setCartItems([]); // fallback
        return;
      }

      // Backend đã trả về đầy đủ thông tin sản phẩm
      const itemsWithInfo = data.items.map((item: any) => {
        // Đảm bảo có đầy đủ thông tin cần thiết
        if (!item._id || !item.name || !item.price) {
          console.warn('❌ Item thiếu thông tin:', item);
          return null;
        }

        return {
          _id: item._id,
          name: item.name,
          price: item.price,
          sale: item.sale || 0,
          img_url: item.img_url || '',
          quantity: item.quantity || 1
        };
      }).filter(Boolean); // Loại bỏ các item null

      console.log('✅ Processed cart items:', itemsWithInfo);
      setCartItems(itemsWithInfo);
    } catch (error) {
      console.error('❌ Lỗi khi load cart:', (error as Error).message);
      setCartItems([]);
    }
  };

  // Lắng nghe event logout để clear cart
  useEffect(() => {
    const handleLogout = (event: Event) => {
      console.log('🛒 Clearing cart due to logout...');
      setCartItems([]);
    };

    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  // Load cart khi authentication thay đổi
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const addToCart = async (item: CartItem) => {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    if (!isAuthenticated) {
      setShowLoginNotification(true);
      return;
    }

    try {
      const existing = cartItems.find(p => p._id === item._id);
      if (existing) {
        await updateCartItemAPI(item._id, existing.quantity + item.quantity);
      } else {
       await addToCartAPI(item._id, item.quantity || 1);
      }
      await loadCart();
    } catch (error: any) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error?.response?.data || error.message);
      
      // Nếu lỗi 401 (Unauthorized), chuyển về trang đăng nhập
      if (error?.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        navigate('/login');
      }
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await removeCartItemAPI(id);
      await loadCart();
    } catch (error: any) {
      console.error('❌ Lỗi khi xoá sản phẩm:', error?.response?.data || error.message);
    }
  };

  const increaseQuantity = async (id: string) => {
    try {
      const item = cartItems.find(i => i._id === id);
      if (item) {
        await updateCartItemAPI(id, item.quantity + 1);
        await loadCart();
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi tăng số lượng:', error?.response?.data || error.message);
    }
  };

  const decreaseQuantity = async (id: string) => {
    try {
      const item = cartItems.find(i => i._id === id);
      if (item && item.quantity > 1) {
        await updateCartItemAPI(id, item.quantity - 1);
        await loadCart();
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi giảm số lượng:', error?.response?.data || error.message);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartAPI();
      await loadCart();
    } catch (error: any) {
      console.error('❌ Lỗi khi xoá giỏ hàng:', error?.response?.data || error.message);
    }
  };

  const reloadCart = async () => {
    console.log('🔄 Reloading cart from server...');
    try {
      await loadCart();
      console.log('✅ Cart reloaded successfully');
    } catch (error) {
      console.error('❌ Error reloading cart:', error);
    }
  };

  const forceClearCart = () => {
    console.log('🛒 Force clearing cart...');
    console.log('🛒 Cart items before clear:', cartItems);
    setCartItems([]);
    console.log('✅ Cart cleared immediately');
    
    // Cũng gọi API để xóa trong database
    clearCartAPI().catch(error => {
      console.error('❌ Error clearing cart in database:', error);
    });
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      await updateCartItemAPI(id, quantity);
      await loadCart();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số lượng:', error);
    }
  };

  const openCart = () => setIsSidebarOpen(true);
  const closeCart = () => setIsSidebarOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        totalQuantity,
        isSidebarOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        forceClearCart,
        reloadCart,
        updateQuantity,
      }}
    >
      {children}
      <LoginNotification 
        isOpen={showLoginNotification} 
        onClose={() => setShowLoginNotification(false)} 
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
