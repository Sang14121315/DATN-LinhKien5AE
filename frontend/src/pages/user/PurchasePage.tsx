import React, { useState } from "react";
import { FaSearch, FaClipboard } from "react-icons/fa";
import { useOrders } from "@/context/OrderContext";
import type { Order } from "@/context/OrderContext";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import "@/styles/pages/user/purchase.scss";
import { fetchProductById } from "@/api/user/productAPI";

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

const PurchasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { orders, updateOrderStatus } = useOrders();
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

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

  // Sửa handler để chuyển hướng đến productDetail với orderId
  const handleReviewOrder = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const productId = typeof order.items[0].product_id === "string" 
        ? order.items[0].product_id 
        : (order.items[0].product_id as { _id: string })?._id || "";
      if (productId) {
        navigate(`/product/${productId}?orderId=${order._id}`);
      } else {
        alert("Không tìm thấy sản phẩm trong đơn hàng!");
      }
    } else {
      alert("Đơn hàng không có sản phẩm để đánh giá!");
    }
  };

  return (
    <div className="purchase-page">
      <div className="purchase-container">
        <div className="purchase-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
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
            <div className="order-list">
              {filteredOrders.map((order) => (
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
                        ? item.img_url
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
                    {["pending", "confirmed", "processing"].includes(order.status) && (
                      <button className="cancel-btn" onClick={() => handleCancelOrder(order._id)}>
                        Hủy đơn hàng
                      </button>
                    )}
                    {order.status === "completed" && (
                      <button className="review-btn" onClick={() => handleReviewOrder(order)}>
                        Nhận xét
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;