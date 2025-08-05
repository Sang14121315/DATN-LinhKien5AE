import React from 'react';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
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

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("❗Bạn chưa có sản phẩm nào trong giỏ hàng!");
      return;
    }

    onClose();
    setTimeout(() => {
      navigate("/checkout");
    }, 200);
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
          <span className="item-count">({cartItems.length})</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      <div className="cart-content">
        {cartItems.length === 0 ? (
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
                  <img src={item.img_url} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-price">{item.price.toLocaleString()} đ</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn minus"
                        onClick={() => decreaseQuantity(item._id)}
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
      {cartItems.length > 0 && (
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
