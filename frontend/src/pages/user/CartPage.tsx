import React from "react";
import "@/styles/pages/user/cartPage.scss";
import { FaTrashAlt } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2>🛒 Giỏ hàng của bạn</h2>
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <p>Giỏ hàng trống.</p>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <img src={item.img_url} alt={item.name} />
              <div className="cart-info">
                <h4>{item.name}</h4>
                <p>{item.price.toLocaleString()}₫</p>
                <div className="cart-actions">
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                  />
                  <button onClick={() => removeFromCart(item._id)}>
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <h3>Tổng cộng: {total.toLocaleString()}₫</h3>
        <button className="checkout-btn" onClick={() => navigate("/checkout")}>
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
};

export default CartPage;
