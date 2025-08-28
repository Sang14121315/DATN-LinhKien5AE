import React from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import '@/styles/components/user/cartSidebar.scss';
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const {
    cartItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const backendBase = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
  const resolveImageUrl = (url?: string) => {
    if (!url || url.trim() === '') return '';
    const normalized = url.startsWith('uploads') ? `/${url}` : url;
    if (/^https?:\/\//i.test(normalized)) return normalized;
    if (normalized.startsWith('/uploads')) return `${backendBase}${normalized}`;
    return normalized;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert("❗Vui lòng đăng nhập để đặt hàng!");
      onClose();
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("❗Bạn chưa có sản phẩm nào trong giỏ hàng!");
      return;
    }

    onClose();
    setTimeout(() => {
      navigate("/checkout");
    }, 200);
  };

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="cart-header">
        <div className="header-content">
          <div className="header-left">
            <FaShoppingCart className="cart-icon" />
            <h3>Giỏ hàng của tôi</h3>
          </div>
          <span className="item-count">({cartItems.reduce((total, item) => total + item.quantity, 0)})</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      <div className="cart-content">
        {!isAuthenticated ? (
          <div className="empty-cart">
            <div className="empty-icon">🔐</div>
            <p>Vui lòng đăng nhập để xem giỏ hàng</p>
            <button className="continue-shopping" onClick={handleLogin}>
              Đăng nhập ngay
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <p>Chưa có sản phẩm nào trong giỏ hàng</p>
            <button className="continue-shopping" onClick={onClose}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item" key={item._id}>
                <div className="item-image">
                  <img 
                    src={resolveImageUrl(item.img_url) || 'https://via.placeholder.com/60x60/f0f0f0/999999?text=SP'} 
                    alt={item.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/60x60/f0f0f0/999999?text=SP';
                    }}
                  />
                </div>
                <div className="item-details">
                  <div className="item-info">
                    <h4 className="item-name" title={item.name}>
                      {item.name.length > 30 ? `${item.name.substring(0, 30)}...` : item.name}
                    </h4>
                    <p className="item-price">
                      {item.sale && item.sale > 0 ? 
                        `${(item.price - item.sale).toLocaleString()} đ` : 
                        `${item.price.toLocaleString()} đ`
                      }
                    </p>
                    <p className="item-total">
                      Tổng: {((item.sale && item.sale > 0 ? item.price - item.sale : item.price) * item.quantity).toLocaleString()} đ
                    </p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => decreaseQuantity(item._id)}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn plus"
                        onClick={() => increaseQuantity(item._id)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                      title="Xóa sản phẩm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {isAuthenticated && cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="total-section">
            <span className="total-label">Tổng tiền:</span>
            <span className="total-price">{totalPrice.toLocaleString()} đ</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="checkout-btn"
          >
            Đặt hàng ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;
