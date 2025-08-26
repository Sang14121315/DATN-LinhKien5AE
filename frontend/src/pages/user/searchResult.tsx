import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProductsAPI } from "@/api/user/searchAPI";
import { Product } from "@/api/user/productAPI";
import { FaShoppingCart, FaRegHeart, FaHeart } from "react-icons/fa";
import { Row, Col } from "antd";
import axios from "axios";

import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import "@/styles/pages/user/productList.scss";

const SearchResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { addToFavorite, removeFromFavorite, favorites } = useFavorite();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      searchProductsAPI(query)
        .then(setProducts)
        .catch(() => setProducts([]));
    }
  }, [query]);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleFavoriteClick = async (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      navigate("/login");
      return;
    }

    try {
      const isFavorite = favorites.some((f) => f._id === product._id);
      if (isFavorite) {
        await axios.post(
          "/api/favorite/remove",
          { product_id: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        removeFromFavorite(product._id);
      } else {
        await axios.post(
          "/api/favorite/add",
          { product_id: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToFavorite({
          _id: product._id,
          name: product.name,
          price: product.price,
          img_url: product.img_url,
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("Lỗi khi cập nhật yêu thích:", err.response?.data || err.message);
    }
  };

  const getImageUrl = (url?: string): string => {
    if (!url) return '/images/no-image.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/products/${url}`;
  };

  // Component StarRating
  const StarRating: React.FC<{ rating?: number }> = ({ rating }) => {
    if (!rating || rating <= 0) return null;
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div style={{ color: '#FFD700', fontSize: '1.5em', margin: '8px 0 4px 0', display: 'flex', alignItems: 'center' }}>
        <span>{'★'.repeat(fullStars)}{halfStar ? '½' : ''}{'☆'.repeat(emptyStars)}</span>
        <span style={{ color: '#333', marginLeft: 8, fontSize: '0.9em' }}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="product-page-container">
      <div className="product-layout">
        <Col xs={24} sm={24} md={24} lg={24} className="product-content">
          <div className="product-header">
            <h2 style={{ textAlign: "center" }}>
              Kết quả tìm kiếm cho: <em>{query}</em>
            </h2>
            <p
              style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "15px",
                color: "#666",
              }}
            >
              Có <strong> {products.length} sản phẩm </strong> cho tìm kiếm
            </p>
          </div>

          <Row gutter={[16, 16]} className="product-grid">
            {products.length > 0 ? (
              products.map((product) => {
                const isFavorite = favorites.some((f) => f._id === product._id);
                return (
                  <Col xs={12} sm={8} md={6} lg={6} key={product._id}>
                    <div className="product-card">
                      <img
                        src={getImageUrl(product.img_url)}
                        alt={product.name}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      />
                      <p className="product-brand">
                        {typeof product.brand_id === "object"
                          ? product.brand_id.name
                          : product.brand_id}
                      </p>
                      <h4 className="product-name">{product.name}</h4>
                      {product.averageRating && product.averageRating > 0 && <StarRating rating={product.averageRating} />}
                      
                      <div className="price-block">
                        <div className="price-left">
                          {product.sale ? (
                            <>
                              <div className="discount-price">
                                {formatCurrency(product.price * 0.66)}
                              </div>
                              <div className="original-price">
                                {formatCurrency(product.price)}
                              </div>
                            </>
                          ) : (
                            <div className="discount-price">
                              {formatCurrency(product.price)}
                            </div>
                          )}
                        </div>

                        {product.sale && product.price > 0 && (
                          <div className="discount-percent">
                            -{Math.round((product.sale / product.price) * 100)}%
                          </div>
                        )}
                      </div>

                      <div className="action-buttons">
                        <button
                          className="add-to-cart-btn"
                          onClick={() =>
                            addToCart({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              sale: product.sale && product.sale > 0 ? product.sale : 0,
                              img_url: product.img_url,
                              quantity: 1,
                            })
                          }
                        >
                          <FaShoppingCart className="cart-icon" />
                          <span className="btn-text">Thêm vào giỏ</span>
                        </button>

                        <button
                          className="favorite-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(product);
                          }}
                        >
                          {isFavorite ? <FaHeart /> : <FaRegHeart />}
                        </button>
                      </div>
                    </div>
                  </Col>
                );
              })
            ) : (
              <p style={{ padding: "16px", textAlign: "center", width: "100%" }}>
                Không có sản phẩm phù hợp.
              </p>
            )}
          </Row>
        </Col>
      </div>
    </div>
  );
};

export default SearchResult;

