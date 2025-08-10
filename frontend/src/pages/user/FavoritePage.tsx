import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/styles/pages/user/favorite.scss";

const FavoritePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`/favorite/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (Array.isArray(response.data)) {
          setFavorites(response.data);
        } else {
          setFavorites([]);
          setError("Dữ liệu yêu thích không hợp lệ từ server.");
        }
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        setError(error.message || "Không thể tải danh sách yêu thích.");
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const removeFavorite = async (productId: string) => {
    try {
      await axios.post(`/favorite/remove`, { product_id: productId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFavorites(favorites.filter((fav) => fav.product_id._id !== productId));
      setError(null);
    } catch (error: any) {
      console.error("Lỗi khi xóa khỏi yêu thích:", error);
      setError(error.message || "Không thể xóa sản phẩm khỏi yêu thích.");
    }
  };

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập để xem danh sách yêu thích!</div>;
  }

  return (
    <div className="container">
      <h1>Danh sách yêu thích</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {favorites.length === 0 ? (
        <div className="grid">
          <div className="border text-center">
            <FaHeart className="text-4xl" />
            <p className="text-gray-500">Chưa có sản phẩm nào trong danh sách yêu thích.</p>
          </div>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((fav) => (
            <div key={fav.product_id._id} className="border">
              <img
                src={fav.product_id.img_url || "https://via.placeholder.com/150"}
                alt={fav.product_id.name}
                className="img"
              />
              <h3>{fav.product_id.name.length > 20 ? `${fav.product_id.name.substring(0, 20)}...` : fav.product_id.name}</h3>
              <p>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(fav.product_id.price)}</p>
              <div className="flex">
                <button onClick={() => removeFavorite(fav.product_id._id)} className="remove">
                  <FaTrash className="mr-1" /> Xóa
                </button>
                <button onClick={() => addToCart({ ...fav.product_id, quantity: 1 })} className="add-to-cart">
                  <FaShoppingCart className="mr-1" /> Thêm giỏ
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