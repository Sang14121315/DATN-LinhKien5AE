import React, { useState, useEffect } from "react";
import { FaSearch, FaClipboard } from "react-icons/fa";
import { useOrders } from "@/context/OrderContext";
import type { Order } from "@/context/OrderContext";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "@/styles/pages/user/purchase.scss";
import { fetchProductById } from "@/api/user/productAPI";
import axios from "@/api/user/index";
import { Modal, Button, Tag } from 'antd';

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "confirmed", label: "Đã xác nhận" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Đã giao" },
  { id: "canceled", label: "Đã hủy" },
];

const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Đang chờ xử lý",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Đã giao",
    canceled: "Đã hủy",
    processing: "Đang xử lý",
    paid: "Đã thanh toán",
  };
  return statusMap[status] || status;
};

interface ReviewStatus {
  [orderId: string]: {
    [productId: string]: boolean; // true if reviewed, false if not
  };
}

const PurchasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>({});
  const [loadingReviews, setLoadingReviews] = useState<string[]>([]); // Array of orderIds đang loading
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const ordersPerPage = 5;
  const { orders, updateOrderStatus } = useOrders();
  const { clearCart, addToCart } = useCart();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Fetch review status for all completed orders
  useEffect(() => {
    const fetchReviewStatuses = async () => {
      if (!isAuthenticated) return;

      const completedOrders = orders.filter(order => order.status === "completed");
      const newReviewStatus: ReviewStatus = {};
      const loadingOrders: string[] = completedOrders.map(order => order._id);

      setLoadingReviews(loadingOrders); // Bắt đầu loading

      for (const order of completedOrders) {
        newReviewStatus[order._id] = {};
        
        for (const item of order.items || []) {
          const productId = typeof item.product_id === "string" 
            ? item.product_id 
            : (item.product_id as { _id: string })?._id;
            
          if (productId) {
            try {
              // Check if user has reviewed this product from this order
              const response = await axios.get(`/api/review/check-reviewed/${order._id}/${productId}`);
              newReviewStatus[order._id][productId] = response.data.isReviewed;
            } catch (error) {
              console.error(`Error checking review status for order ${order._id}, product ${productId}:`, error);
              newReviewStatus[order._id][productId] = true; // Assume reviewed nếu error, để ẩn nút an toàn
            }
          }
        }
      }

      setReviewStatus(newReviewStatus);
      setLoadingReviews([]); // Kết thúc loading
    };

    fetchReviewStatuses();
  }, [orders, isAuthenticated]);

  const filteredOrders = orders
    .filter(order => {
      if (activeTab === "all") return true;
      return order.status === activeTab;
    })
    .filter(order => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      if (order._id.toLowerCase().includes(q)) return true;
      if (order.customer?.name && order.customer.name.toLowerCase().includes(q)) return true;
      if (order.items && order.items.some(item => typeof item.name === 'string' && item.name.toLowerCase().includes(q))) return true;
      return false;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleReorder = async (order: Order) => {
    await clearCart();
    for (const item of order.items) {
      let productId: string = '';
      if (typeof item.product_id === 'string') {
        productId = item.product_id;
      } else if (item.product_id && typeof item.product_id === 'object' && '_id' in item.product_id) {
        productId = (item.product_id as { _id: string })._id;
      }
      if (!productId) continue;
      try {
        const product = await fetchProductById(productId);
        await addToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          img_url: product.img_url,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error("Lỗi khi thêm sản phẩm vào giỏ:", error);
      }
    }
    navigate("/cart");
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "canceled");
      console.log(`Đơn hàng ${orderId} đã được hủy.`);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
    }
  };

  const handleReviewOrder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      alert("Đơn hàng không có sản phẩm để đánh giá!");
      return;
    }
    setReviewModalOrder(order);
    setReviewModalOpen(true);
  };

  const handleSelectProductToReview = (order: Order, productId: string, isReviewed: boolean) => {
    setReviewModalOpen(false);
    setReviewModalOrder(null);
    // Điều hướng đến trang sản phẩm; nếu đã đánh giá, vẫn hiển thị sản phẩm đó
    navigate(`/product/${productId}?orderId=${order._id}`);
  };

  // Check if order has any unreviewed products
  const hasUnreviewedProducts = (order: Order): boolean => {
    if (!order.items || order.items.length === 0) return false;
    
    // Nếu đang loading cho order này, ẩn nút tạm thời
    if (loadingReviews.includes(order._id)) return false;

    // Nếu reviewStatus chưa load cho order, ẩn nút (thay vì assume true như cũ)
    if (!reviewStatus[order._id]) return false;

    return order.items.some(item => {
      const productId = typeof item.product_id === "string" 
        ? item.product_id 
        : (item.product_id as { _id: string })?._id;
      
      if (!productId) return false;
      
      // Return true nếu chưa reviewed (false hoặc undefined)
      return !reviewStatus[order._id][productId];
    });
  };

  return (
    <div className="purchase-page">
      <div className="purchase-container">
        <div className="purchase-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-section">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        <div className="purchase-content">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaClipboard />
              </div>
              <div className="empty-text">
                Chưa có đơn hàng
              </div>
            </div>
          ) : (
            <>
              <div className="order-list">
                {currentOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <h4>
                      🧾 Mã đơn: <span style={{ color: "#555" }}>{order._id}</span>
                    </h4>
                    <div className="order-info">
                      <span>👤 Khách: {order.customer?.name || "Không rõ"}</span>
                      <span>📅 Ngày: {new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
                      <span>🚚 Trạng thái: <strong>{translateStatus(order.status)}</strong></span>
                      <span>💰 Tổng: {order.total.toLocaleString()} ₫</span>
                    </div>
                    <div className="order-items">
                      {(order.items || []).map((item, index) => {
                        const productId = typeof item.product_id === "string" ? item.product_id : `item-${index}`;
                        const key = `${order._id}-${productId}-${index}`;
                        const imgSrc = item.img_url && item.img_url !== ""
                          ? resolveImageUrl(item.img_url)
                          : "/images/placeholder.png";
                        const altText = typeof item.name === "string" ? item.name : "Sản phẩm";
                        return (
                          <div key={key} className="item">
                            <img src={imgSrc} alt={altText} className="product-image" />
                            <div>
                              <p>{altText}</p>
                              <p>Số lượng: {item.quantity}</p>
                              <p>Giá: {item.price.toLocaleString()} ₫</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="button-group">
                      <button className="reorder-btn" onClick={() => handleReorder(order)}>
                        Mua lần nữa
                      </button>
                      {["pending", "confirmed", "processing"].includes(order.status) ? (
                        <button className="cancel-btn" onClick={() => handleCancelOrder(order._id)}>
                          Hủy đơn hàng
                        </button>
                      ) : order.status === "completed" && isAuthenticated && hasUnreviewedProducts(order) ? (
                        <button className="review-btn" onClick={() => handleReviewOrder(order)}>
                          Đánh giá
                        </button>
                      ) : (
                        <div className="placeholder-btn"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Modal chọn sản phẩm để đánh giá */}
      <Modal
        open={reviewModalOpen}
        onCancel={() => { setReviewModalOpen(false); setReviewModalOrder(null); }}
        footer={null}
        title="Chọn sản phẩm để đánh giá"
        centered
      >
        {reviewModalOrder && (
          <div style={{ display: 'grid', gap: 12 }}>
            {(reviewModalOrder.items || []).map((item, index) => {
              const productId = typeof item.product_id === 'string'
                ? item.product_id
                : (item.product_id as { _id?: string })?._id || '';
              if (!productId) return null;
              const isReviewed = !!reviewStatus[reviewModalOrder._id]?.[productId];
              const imgSrc = item.img_url && item.img_url !== '' ? resolveImageUrl(item.img_url) : '/images/placeholder.png';
              const name = typeof item.name === 'string' ? item.name : 'Sản phẩm';
              return (
                <div key={`${reviewModalOrder._id}-${productId}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={imgSrc} alt={name} style={{ width: 56, height: 56, objectFit: 'contain', border: '1px solid #eee', borderRadius: 6 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>SL: {item.quantity} • Giá: {item.price.toLocaleString()} ₫</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isReviewed ? <Tag color="green">Đã đánh giá</Tag> : <Tag color="blue">Chưa đánh giá</Tag>}
                    <Button type={isReviewed ? 'default' : 'primary'} onClick={() => handleSelectProductToReview(reviewModalOrder, productId, isReviewed)}>
                      {isReviewed ? 'Xem sản phẩm' : 'Đánh giá'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchasePage;