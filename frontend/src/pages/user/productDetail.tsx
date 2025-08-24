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

interface UnreviewedOrder {
  _id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  img_url: string;
  order_created_at: string;
}

// ✅ Interface cho stock info
interface StockInfo {
  product_id: string;
  product_name: string;
  total_stock: number;
  reserved_stock: number;
  available_stock: number;
  is_available: boolean;
  updated_at: string;
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
  const [unreviewedOrders, setUnreviewedOrders] = useState<UnreviewedOrder[]>([]);
  const [userLatestReview, setUserLatestReview] = useState<Review | null>(null);
  const [canUserReview, setCanUserReview] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showAlreadyReviewedPopup, setShowAlreadyReviewedPopup] = useState(false);
  
  // ✅ State mới để quản lý thông tin tồn kho real-time
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // ✅ Function để fetch thông tin tồn kho real-time với endpoint đúng
  const fetchStockInfo = async (productId: string): Promise<StockInfo | null> => {
    try {
      setIsLoadingStock(true);
      console.log(`🔄 Fetching stock info for product: ${productId}`);
      
      // ✅ SỬA: Sử dụng endpoint đúng từ routes
      const response = await axios.get(`/api/product/stock-info/${productId}`);
      console.log('✅ Stock info response:', response.data);
      
      const stockData: StockInfo = response.data;
      setStockInfo(stockData);
      
      return stockData;
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy thông tin tồn kho:", error);
      
      // ✅ Fallback: Nếu API lỗi, sử dụng thông tin từ product hiện tại
      if (product) {
        const fallbackStock: StockInfo = {
          product_id: product._id,
          product_name: product.name,
          total_stock: product.stock,
          reserved_stock: 0,
          available_stock: product.stock,
          is_available: product.stock > 0,
          updated_at: new Date().toISOString()
        };
        setStockInfo(fallbackStock);
        return fallbackStock;
      }
      
      return null;
    } finally {
      setIsLoadingStock(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductById(id as string);
        console.log('📦 Product data:', data);
        setProduct(data);

        // ✅ Fetch thông tin tồn kho real-time ngay sau khi có product
        if (data._id) {
          await fetchStockInfo(data._id);
        }

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

        // Fetch reviews
        const reviewResponse = await axios.get(`/api/review/product/${id}`);
        console.log("Fetched reviews:", reviewResponse.data);
        setReviews(reviewResponse.data);

        // Fetch user-specific data if authenticated
        if (isAuthenticated) {
          try {
            // Check if user can review this product
            const canReviewResponse = await axios.get(`/api/review/can-review/${id}`);
            setCanUserReview(canReviewResponse.data.canReview);

            // Get user's latest review for this product
            const userReviewResponse = await axios.get(`/api/review/user-latest/${id}`);
            setUserLatestReview(userReviewResponse.data);

            // Get unreviewed orders if user can review
            if (canReviewResponse.data.canReview) {
              const unreviewedResponse = await axios.get(`/api/review/unreviewed-orders/${id}`);
              setUnreviewedOrders(unreviewedResponse.data);
            }
          } catch (error) {
            console.log("User review data fetch failed:", error);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();

    // ✅ Set interval để refresh stock info mỗi 30 giây
    const stockRefreshInterval = setInterval(() => {
      if (id) {
        fetchStockInfo(id);
      }
    }, 30000);

    return () => {
      clearInterval(stockRefreshInterval);
    };
  }, [id, isAuthenticated]);

  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      navigate("/login");
      return;
    }

    if (!canUserReview) {
      alert("Bạn cần mua sản phẩm này để có thể đánh giá!");
      return;
    }

    setIsModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      navigate("/login");
      return;
    }

    if (!rating || !comment) {
      alert("Vui lòng chọn số sao và nhập bình luận!");
      return;
    }

    // Tự động chọn đơn hàng chưa review đầu tiên
    const orderDetailToReview = unreviewedOrders.length > 0 ? unreviewedOrders[0]._id : null;
    
    if (!orderDetailToReview) {
      setShowAlreadyReviewedPopup(true);
      return;
    }

    try {
      console.log("Sending review:", {
        product_id: id,
        order_detail_id: orderDetailToReview,
        rating,
        comment
      });

      const response = await axios.post("/api/review/add", {
        product_id: id,
        order_detail_id: orderDetailToReview,
        rating,
        comment,
      });

      if (response.status === 200 || response.status === 201) {
        const newReview: Review = {
          ...response.data,
          user_id: {
            _id: user?._id || "",
            name: user?.name || "Người dùng ẩn danh",
          },
          created_at: new Date().toISOString(),
        };

        // Update reviews list - remove old review and add new one
        setReviews((prevReviews) => {
          const filteredReviews = prevReviews.filter(r => r.user_id._id !== user?._id);
          return [newReview, ...filteredReviews];
        });
        
        // Reset form
        setRating(0);
        setComment("");
        setIsModalOpen(false);
        setVisibleReviews(5);

        // Refresh user review data
        const canReviewResponse = await axios.get(`/api/review/can-review/${id}`);
        setCanUserReview(canReviewResponse.data.canReview);
        
        const userReviewResponse = await axios.get(`/api/review/user-latest/${id}`);
        setUserLatestReview(userReviewResponse.data);

        if (canReviewResponse.data.canReview) {
          const unreviewedResponse = await axios.get(`/api/review/unreviewed-orders/${id}`);
          setUnreviewedOrders(unreviewedResponse.data);
        } else {
          setUnreviewedOrders([]);
        }

        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
      } else if (error.response?.data?.message === 'ALREADY_REVIEWED') {
        setShowAlreadyReviewedPopup(true);
      } else {
        alert(error.response?.data?.message || "Không thể gửi đánh giá, vui lòng thử lại!");
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
        // Find the review to get the order_detail_id
        const reviewToDelete = reviews.find(r => r._id === reviewId);
        if (!reviewToDelete) {
          alert("Không tìm thấy đánh giá để xóa!");
          return;
        }

        await axios.post("/api/review/remove", { 
          order_detail_id: userLatestReview?.order_detail_id
        });
        
        setReviews(reviews.filter((review) => review._id !== reviewId));
        setUserLatestReview(null);
        setVisibleReviews(5);
        
        // Refresh user review data
        const canReviewResponse = await axios.get(`/api/review/can-review/${id}`);
        setCanUserReview(canReviewResponse.data.canReview);
        
        if (canReviewResponse.data.canReview) {
          const unreviewedResponse = await axios.get(`/api/review/unreviewed-orders/${id}`);
          setUnreviewedOrders(unreviewedResponse.data);
        }
        
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

  // ✅ Function để xử lý thêm vào giỏ hàng với kiểm tra tồn kho real-time
  const handleAddToCart = async (productToAdd: Product, quantityToAdd: number) => {
    try {
      console.log(`🛒 Adding to cart: ${quantityToAdd} units of ${productToAdd.name}`);
      
      // ✅ Refresh stock info trước khi thêm vào giỏ
      const latestStockInfo = await fetchStockInfo(productToAdd._id);
      
      if (!latestStockInfo) {
        alert("Không thể kiểm tra tồn kho, vui lòng thử lại!");
        return;
      }
      
      // ✅ Kiểm tra tồn kho available
      if (latestStockInfo.available_stock < quantityToAdd) {
        alert(`Không đủ hàng trong kho! Chỉ còn ${latestStockInfo.available_stock} sản phẩm có thể mua.`);
        return;
      }
      
      console.log(`✅ Stock check passed. Available: ${latestStockInfo.available_stock}, Requested: ${quantityToAdd}`);
      addToCart({ ...productToAdd, quantity: quantityToAdd });
      
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra tồn kho:", error);
      alert("Không thể kiểm tra tồn kho, vui lòng thử lại!");
    }
  };

  if (!product) return <div>Đang tải sản phẩm...</div>;

  const discountPercent = product.sale ? Math.round((1 - 0.66) * 100) : 0;
  const priceAfterSale = product.sale ? product.price * 0.66 : product.price;

  // ✅ Sử dụng stockInfo nếu có, fallback về product.stock
  const availableStock = stockInfo?.available_stock ?? product.stock;
  const isOutOfStock = availableStock <= 0;

  console.log('🔍 Current stock info:', {
    stockInfo,
    availableStock,
    isOutOfStock,
    productStock: product.stock
  });

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
                className={!isOutOfStock ? "in-stock" : "out-of-stock"}
              >
                {isLoadingStock ? (
                  "Đang cập nhật..."
                ) : !isOutOfStock ? (
                  <>
                    Còn hàng ({availableStock})
                    {stockInfo?.reserved_stock && stockInfo.reserved_stock > 0 && (
                      <span className="reserved-info">
                        {" "}(Đã giữ: {stockInfo.reserved_stock})
                      </span>
                    )}
                  </>
                ) : (
                  "Hết hàng"
                )}
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
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                max={availableStock}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    // Giới hạn số lượng không vượt quá tồn kho available
                    setQuantity(Math.min(val, availableStock));
                  }
                }}
              />
              <button 
                onClick={() => setQuantity((prev) => Math.min(prev + 1, availableStock))}
                disabled={quantity >= availableStock || isOutOfStock}
              >
                +
              </button>
            </div>
            {quantity >= availableStock && availableStock > 0 && (
              <span className="stock-warning">
                Đã đạt số lượng tối đa có thể mua ({availableStock})
              </span>
            )}
          </div>

          <div className="cta">
            <button
              className="add-cart"
              onClick={() => handleAddToCart(product, quantity)}
              disabled={isOutOfStock || isLoadingStock}
            >
              <FaCartPlus /> {isOutOfStock ? "HẾT HÀNG" : isLoadingStock ? "ĐANG CẬP NHẬT..." : "THÊM VÀO GIỎ"}
            </button>
            <button
              className="buy-now"
              onClick={async () => {
                await handleAddToCart(product, quantity);
                if (!isOutOfStock) {
                  navigate("/checkout");
                }
              }}
              disabled={isOutOfStock || isLoadingStock}
            >
              {isOutOfStock ? "HẾT HÀNG" : isLoadingStock ? "ĐANG CẬP NHẬT..." : "MUA NGAY"}
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
                  handleAddToCart(rp, 1);
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
                      handleAddToCart(vp, 1);
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

        {/* User's review status */}
        {isAuthenticated && (
          <div className="user-review-status">
            {userLatestReview && (
              <div className="current-user-review">
                <h4>Đánh giá đã có của bạn:</h4>
                <div className="review-item user-own-review">
                  <div className="review-header">
                    <span className="review-user">{userLatestReview.user_id.name}</span>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= userLatestReview.rating ? "star active" : "star"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{userLatestReview.comment}</p>
                  {userLatestReview.reply && (
                    <p className="review-reply">
                      <strong>Phản hồi từ quản trị viên:</strong> {userLatestReview.reply}
                    </p>
                  )}
                  <p className="review-date">
                    {new Date(userLatestReview.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          className={`write-review-btn ${!canUserReview ? 'disabled' : ''}`}
          onClick={handleOpenReviewModal}
          disabled={!canUserReview}
        >
          {canUserReview ? 'Viết đánh giá' : 'Vui lòng mua hàng để được đánh giá'}
        </button>

        <div className="review-list">
          {reviews.length > 0 ? (
            <>
              {reviews.slice(0, visibleReviews).map((review) => (
                <div key={review._id} className={`review-item ${userLatestReview?._id === review._id ? 'user-own-review' : ''}`}>
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
              <button className="submit-review" onClick={handleSubmitReview}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="success-popup-overlay">
            <div className="success-popup-content">
              <p>✅ Bạn đã đánh giá thành công!</p>
            </div>
          </div>
        )}

        {/* Already Reviewed Popup */}
        {showAlreadyReviewedPopup && (
          <div className="error-popup-overlay" onClick={() => setShowAlreadyReviewedPopup(false)}>
            <div className="error-popup-content" onClick={(e) => e.stopPropagation()}>
              <p>Bạn đã đánh giá sản phẩm này rồi, hãy mua thêm để đánh giá lại.</p>
              <button className="error-popup-close" onClick={() => setShowAlreadyReviewedPopup(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;