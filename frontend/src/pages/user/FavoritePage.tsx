import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/styles/pages/user/favorite.scss";
import { useFavorite } from "@/context/FavoriteContext";

const FavoritePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { favorites, removeFromFavorite } = useFavorite();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  if (!isAuthenticated) {
    navigate("/login");
    return <div>Vui lòng đăng nhập để xem danh sách yêu thích!</div>;
  }

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await axios.post(
        `/api/favorite/remove`,
        { product_id: productId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      removeFromFavorite(productId);
      setError(null);
    } catch (error: any) {
      console.error("Lỗi khi xóa khỏi yêu thích:", error);
      setError(error.message || "Không thể xóa sản phẩm khỏi yêu thích.");
    }
  };

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h1>Danh sách yêu thích</h1>
        {favorites.length > 0 && (
          <span className="favorite-count">{favorites.length} sản phẩm</span>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {favorites.length === 0 ? (
        <div className="empty-favorite">
          <div className="empty-content">
            <FaHeart className="empty-icon" />
            <p className="empty-text">Chưa có sản phẩm nào trong danh sách yêu thích.</p>
            <button 
              className="browse-button"
              onClick={() => navigate("/")}
            >
              Xem sản phẩm
            </button>
          </div>
        </div>
      ) : (
        <div className="favorite-grid">
          {favorites.map((fav) => (
            <div key={fav._id} className="favorite-item">
              <div className="item-image-container">
                <img
                  src={fav.img_url || "https://via.placeholder.com/150"}
                  alt={fav.name}
                  className="item-image"
                />
              </div>
              <div className="item-details">
                <h3 className="item-name">{fav.name}</h3>
                <p className="item-price">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(fav.price)}
                </p>
              </div>
              <div className="item-actions">
                <button
                  onClick={() => handleRemoveFavorite(fav._id)}
                  className="remove-button"
                >
                  <FaTrash className="button-icon" /> Bỏ yêu thích
                </button>
                <button
                  onClick={() => addToCart({ ...fav, quantity: 1 })}
                  className="add-to-cart-button"
                >
                  <FaShoppingCart className="button-icon" /> Thêm giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;