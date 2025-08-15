import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaFacebook,
  FaFacebookMessenger,
  FaPinterest,
  FaCartPlus,
  FaStar,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { AiFillTwitterCircle } from "react-icons/ai";
import {
  Product,
  fetchFilteredProducts,
  fetchProductById,
} from "@/api/user/productAPI";
import "@/styles/pages/user/productDetail.scss";
import "@/styles/pages/user/reviewSection.scss";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axios from "@/api/user/index";

interface Review {
  _id: string;
  user_id: { _id: string; name: string };
  rating: number;
  comment: string;
  created_at: string;
  reply?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);

        const viewedRaw = localStorage.getItem("viewedProducts");
        const viewed: Product[] = viewedRaw ? JSON.parse(viewedRaw) : [];
        const updatedViewed = [
          data,
          ...viewed.filter((p) => p._id !== data._id),
        ].slice(0, 10);
        localStorage.setItem("viewedProducts", JSON.stringify(updatedViewed));
        const stored = localStorage.getItem("viewedProducts");
        if (stored) {
          setViewedProducts(JSON.parse(stored));
        }

        if (data?.category_id && typeof data.category_id === "object") {
          const categoryId = data.category_id._id || data.category_id;
          const allInSameCategory = await fetchFilteredProducts({
            category_id: categoryId,
          });
          const related = allInSameCategory.filter(
            (p) => String(p._id) !== String(data._id)
          );
          setRelatedProducts(related);
        }

        const reviewResponse = await axios.get(`/api/review/product/${id}`);
        console.log("Fetched reviews:", reviewResponse.data);
        setReviews(reviewResponse.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitReview = async (isUpdate = false) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      navigate("/login");
      return;
    }
    if (!rating || !comment) {
      alert("Vui lòng chọn số sao và nhập bình luận!");
      return;
    }

    try {
      console.log("Sending review for product_id:", id, "user:", user?._id, "rating:", rating, "comment:", comment, "isUpdate:", isUpdate);
      const response = await axios.post("/api/review/add", {
        product_id: id,
        rating,
        comment,
        isUpdate,
      });
      console.log("API Response:", response);
      if (response.status === 200 || response.status === 201) {
        const newReview: Review = {
          ...response.data,
          user_id: {
            _id: user?._id || "",
            name: user?.name || "Người dùng ẩn danh",
          },
          created_at: new Date().toISOString(),
        };
        setReviews((prevReviews) => [
          newReview,
          ...prevReviews.filter((r) => r._id !== newReview._id),
        ]);
        setRating(0);
        setComment("");
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        setVisibleReviews(5);
        alert("Đánh giá đã được gửi thành công!");
      } else {
        throw new Error(`Phản hồi từ server không hợp lệ: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error.response?.data || error.message);
      if (error.response?.data.message === 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa ở trạng thái "Đã giao".') {
        alert("Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao!");
      } else if (
        error.response?.data.message === 'Bạn đã đánh giá sản phẩm này rồi. Bạn có muốn đánh giá lại?' ||
        error.response?.data.message?.includes('E11000 duplicate key error')
      ) {
        setIsConfirmModalOpen(true);
      } else if (error.response?.data.message === 'Bạn đã đánh giá sản phẩm này rồi.') {
        setIsErrorPopupOpen(true);
      } else if (error.response?.status === 404) {
        alert("Không tìm thấy endpoint đánh giá. Vui lòng kiểm tra server!");
      } else if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else {
        alert("Không thể gửi đánh giá, vui lòng thử lại!");
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để xóa đánh giá!");
      navigate("/login");
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      try {
        await axios.post("/api/review/remove", { product_id: id });
        setReviews(reviews.filter((review) => review._id !== reviewId));
        setVisibleReviews(5);
        alert("Đã xóa đánh giá!");
      } catch (error: any) {
        console.error("Lỗi khi xóa đánh giá:", error);
        if (error.response?.status === 404) {
          alert("Không tìm thấy endpoint xóa đánh giá. Vui lòng kiểm tra server!");
        } else if (error.response?.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          navigate("/login");
        } else {
          alert("Không thể xóa đánh giá, vui lòng thử lại!");
        }
      }
    }
  };
const getImageUrl = (url?: string): string => {
  if (!url) return '/images/no-image.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return `http://localhost:5000/uploads/products/${url}`;
};
  const handleViewMore = () => {
    setVisibleReviews(reviews.length);
  };

  const handleCloseErrorPopup = () => {
    setIsErrorPopupOpen(false);
  };

  const handleConfirmReReview = () => {
    setIsConfirmModalOpen(false);
    handleSubmitReview(true);
  };

  const handleCancelReReview = () => {
    setIsConfirmModalOpen(false);
  };

  if (!product) return <div>Đang tải sản phẩm...</div>;

  const discountPercent = product.sale ? Math.round((1 - 0.66) * 100) : 0;
  const priceAfterSale = product.sale ? product.price * 0.66 : product.price;

  return (
    <div className="product-detail-container">
      <div className="product-container">
        <div className="image-section">
          {product.sale && (
            <span className="discount-badge">-{discountPercent}% OFF</span>
          )}
          <img src={getImageUrl(product.img_url)} alt={product.name}  />
        </div>

        <div className="info-section">
          <h1 className="product-name">{product.name}</h1>

          <div className="rating-brand">
            <div className="brand">
              Thương hiệu:{" "}
              <strong>
                {typeof product.brand_id === "object"
                  ? product.brand_id.name
                  : product.brand_id}
              </strong>
            </div>
            <div className="availability">
              Tình trạng:{" "}
              <strong
                className={product.stock > 0 ? "in-stock" : "out-of-stock"}
              >
                {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
              </strong>
            </div>
          </div>

          <div className="price-section">
            <div className="discount-price">
              {formatCurrency(priceAfterSale)}
            </div>
            {product.sale && (
              <>
                <div className="original-price">
                  {formatCurrency(product.price)}
                </div>
                <div className="discount-percent">-{discountPercent}%</div>
              </>
            )}
          </div>
          <div className="quantity-section">
            <label htmlFor="quantity">Số lượng:</label>
            <div className="quantity-input">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    setQuantity(val);
                  }
                }}
              />
              <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>
          </div>

          <div className="cta">
            <button
              className="add-cart"
              onClick={() => addToCart({ ...product, quantity })}
            >
              <FaCartPlus /> THÊM VÀO GIỎ
            </button>
            <button
              className="buy-now"
              onClick={() => {
                addToCart({ ...product, quantity });
                navigate("/checkout");
              }}
            >
              MUA NGAY
            </button>
          </div>

          <div className="share">
            <span>Chia sẻ:</span>
            <div className="icons">
              <FaFacebook />
              <FaFacebookMessenger />
              <FaPinterest />
              <AiFillTwitterCircle />
            </div>
          </div>
        </div>

        <div className="side-policy">
          <div className="policy-box">
            <div className="chinh-sach">
              <h5>Chính sách bán hàng</h5>
              <p>Cam kết 100% chính hãng</p>
              <p>Hỗ trợ 24/7</p>
            </div>
            <div className="chinh-sach">
              <h5>Thông tin thêm</h5>
              <p>Hoàn tiền 200% nếu hàng giả</p>
              <p>Mở hộp kiểm tra nhận hàng</p>
              <p>Đổi trả trong 7 ngày</p>
            </div>
          </div>
          <img
            src="/assets/banner_sale_productList.png"
            alt="Sale Banner"
            className="side-banner"
          />
        </div>
      </div>

      <div className="description-box">
        <h3>MÔ TẢ SẢN PHẨM</h3>
        <p>{product.description}</p>
      </div>

      <div className="related-products">
        <h2>Sản phẩm liên quan</h2>
        <div className="product-grid">
          {relatedProducts.slice(0, 6).map((rp) => (
            <div
              className="product-card"
              key={rp._id}
              onClick={() => (window.location.href = `/product/${rp._id}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={rp.img_url} alt={rp.name} />
              <p className="product-brand">
                {typeof rp.brand_id === "object"
                  ? rp.brand_id.name
                  : rp.brand_id}
              </p>
              <h4 className="product-name">{rp.name}</h4>
              <div className="price-block">
                {rp.sale ? (
                  <>
                    <span className="discount">
                      {formatCurrency(rp.price * 0.66)}
                    </span>
                    <span className="original">{formatCurrency(rp.price)}</span>
                  </>
                ) : (
                  <span className="discount">{formatCurrency(rp.price)}</span>
                )}
              </div>
              <button
                className="add-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({ ...rp, quantity: 1 });
                }}
              >
                <FaCartPlus /> THÊM VÀO GIỎ
              </button>
            </div>
          ))}
        </div>
      </div>

      {viewedProducts.length > 0 && (
        <div className="related-products">
          <h2>Các sản phẩm đã xem</h2>
          <div className="product-grid">
            {viewedProducts
              .filter((p) => p._id !== product._id)
              .slice(0, 6)
              .map((vp) => (
                <div
                  className="product-card"
                  key={vp._id}
                  onClick={() => (window.location.href = `/product/${vp._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={vp.img_url} alt={vp.name} />
                  <p className="product-brand">
                    {typeof product.brand_id === "object"
                      ? product.brand_id.name
                      : product.brand_id}
                  </p>
                  <h4 className="product-name">{vp.name}</h4>
                  <div className="price-block">
                    {vp.sale ? (
                      <>
                        <span className="discount">
                          {formatCurrency(vp.price * 0.66)}
                        </span>
                        <span className="original">
                          {formatCurrency(vp.price)}
                        </span>
                      </>
                    ) : (
                      <span className="discount">
                        {formatCurrency(vp.price)}
                      </span>
                    )}
                  </div>
                  <button
                    className="add-cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ ...vp, quantity: 1 });
                    }}
                  >
                    <FaShoppingCart /> THÊM VÀO GIỎ
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="review-section">
        <div className="review-header">
          <h2>Đánh giá {product.name}</h2>
          <div className="rating-summary">
            <div className="average-rating">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={
                    index < Math.round(averageRating)
                      ? "star active"
                      : "star"
                  }
                />
              ))}
              <span className="rating-value">
                {averageRating.toFixed(1)} / 5
              </span>
            </div>
            <span className="total-reviews">
              ({reviews.length} đánh giá)
            </span>
          </div>
        </div>
        <button className="write-review-btn" onClick={() => setIsModalOpen(true)}>
          Viết đánh giá
        </button>
        <div className="review-list">
          {reviews.length > 0 ? (
            <>
              {reviews.slice(0, visibleReviews).map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <span className="review-user">{review.user_id.name}</span>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= review.rating ? "star active" : "star"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.reply && (
                    <p className="review-reply">
                      <strong>Phản hồi từ quản trị viên:</strong> {review.reply}
                    </p>
                  )}
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  {/* {user && review.user_id._id === user._id && (
                    <button
                      className="delete-review"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      <FaTrash /> Xóa
                    </button>
                  )} */}
                </div>
              ))}
              {reviews.length > 5 && visibleReviews < reviews.length && (
                <button className="view-more-btn" onClick={handleViewMore}>
                  Xem thêm
                </button>
              )}
            </>
          ) : (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
              <h3>Viết đánh giá</h3>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={star <= (hoverRating || rating) ? "star active" : "star"}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <textarea
                className="comment-input"
                placeholder="Viết bình luận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="submit-review" onClick={() => handleSubmitReview()}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        )}

        {isErrorPopupOpen && (
          <div className="error-popup-overlay" onClick={handleCloseErrorPopup}>
            <div className="error-popup-content" onClick={(e) => e.stopPropagation()}>
              <p>Bạn đã đánh giá sản phẩm này, hãy mua thêm để tiếp tục đánh giá.</p>
              <button className="error-popup-close" onClick={handleCloseErrorPopup}>
                Đóng
              </button>
            </div>
          </div>
        )}

        {isConfirmModalOpen && (
          <div className="confirm-modal-overlay" onClick={handleCancelReReview}>
            <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Xác nhận đánh giá lại</h3>
              <p>Bạn đã đánh giá sản phẩm này. Bạn có muốn đánh giá lại không?</p>
              <div className="confirm-modal-buttons">
                <button className="confirm-modal-cancel" onClick={handleCancelReReview}>
                  Hủy
                </button>
                <button className="confirm-modal-confirm" onClick={handleConfirmReReview}>
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;