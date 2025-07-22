import React, { useEffect, useState } from "react";
import { useOrders } from "@/context/OrderContext";
import "@/styles/pages/user/orderTrackingPage.scss";
import { useLocation } from 'react-router-dom';

const OrderTrackingPage: React.FC = () => {
  const { orders, cancelOrder } = useOrders();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'total' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === '1') {
      setShowSuccess(true);
    }
  }, [location.search]);

  const handleCancel = (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn huỷ đơn hàng này?");
    if (confirm) cancelOrder(id);
  };

  if (!orders || !Array.isArray(orders)) {
    return (
      <div className="order-page">
        <h2>📦 Theo dõi đơn hàng</h2>
        <p style={{ textAlign: "center", color: "#777" }}>Đang tải đơn hàng...</p>
      </div>
    );
  }

  const sortedOrders = orders.slice().sort((a, b) => {
    if (sortBy === 'created_at') {
      return sortOrder === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'total') {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
    }
    if (sortBy === 'status') {
      return sortOrder === 'asc'
        ? (a.status || '').localeCompare(b.status || '')
        : (b.status || '').localeCompare(a.status || '');
    }
    return 0;
  });

  return (
    <div className="order-page">
      <h2>📦 Theo dõi đơn hàng</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <label>Sắp xếp:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="created_at">Ngày đặt</option>
          <option value="total">Tổng tiền</option>
          <option value="status">Trạng thái</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          Bạn chưa có đơn hàng nào.
        </p>
      ) : (
        <div className="order-list">
          {sortedOrders.map((order) => (
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

              {order.status === "pending" && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(order._id)}
                >
                  ❌ Huỷ đơn
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showSuccess && (
        <div className="order-success-popup">
          <div className="popup-content">
            <h3>Thanh toán thành công!</h3>
            <p>Cảm ơn bạn đã mua hàng qua Momo.</p>
            <button onClick={() => setShowSuccess(false)}>Đóng</button>
            <span className="close-btn" onClick={() => setShowSuccess(false)}>×</span>
          </div>
        </div>
      )}
    </div>
  );
};

const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Đang chờ xử lý",
    processing: "Đang xử lý",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    confirmed: "Đã xác nhận",
  };
  return statusMap[status] || status;
};

export default OrderTrackingPage;
