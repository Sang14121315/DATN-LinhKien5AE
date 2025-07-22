import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrderAPI } from "@/api/orderAPI";
import "@/styles/pages/admin/orderDetail.scss";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id!);
        console.log("🛠️ Order fetched:", data);
        setOrderData(data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDelete = async () => {
    const confirm = window.confirm("Bạn có chắc muốn xoá đơn hàng này không?");
    if (!confirm) return;

    try {
      await deleteOrderAPI(id!);
      alert("Đã xoá đơn hàng thành công");
      navigate("/admin/order");
    } catch (error) {
      console.error("❌ Xoá đơn thất bại:", error);
      alert("Không thể xoá đơn hàng");
    }
  };

  const formatMoney = (value: number | undefined | null) => {
    if (typeof value !== "number" || isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN") + "₫";
  };

  if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
  if (!orderData) return <p>Không tìm thấy đơn hàng</p>;

  const {
    _id,
    customer,
    items,
    payment_method,
    total,
    status,
    created_at,
    address,
    coupon_code,
    discount_percent,
    final_total
  } = orderData;

  return (
    <div className="admin-order-detail order-detail-flex">
      <div className="order-detail-left">
        <div className="order-card">
          <div className="order-card-row">
            <span className="order-id">Đơn hàng #{_id}</span>
            <span className="order-status done">Đã duyệt</span>
          </div>
          <div className="order-info-row"><FaCalendarAlt /> <span>Ngày</span> <b>{created_at ? new Date(created_at).toLocaleDateString('vi-VN') : ''}</b></div>
          <div className="order-info-row"><FaMoneyBillWave /> <span>Thanh toán</span> <b>{payment_method === 'cod' ? 'Tiền mặt' : 'Chuyển khoản'}</b></div>
        </div>
        <div className="order-card">
          <div className="order-card-title">Khách hàng</div>
          <div className="order-info-row"><FaUser /> <span>Tên khách hàng</span> <b>{customer?.name || '(Không có tên)'}</b></div>
          <div className="order-info-row"><FaEnvelope /> <span>Email</span> <b>{customer?.email || '(Không có email)'}</b></div>
          <div className="order-info-row"><FaPhone /> <span>Điện thoại</span> <b>{customer?.phone || '(Không có số)'}</b></div>
          <div className="order-info-row"><FaMapMarkerAlt /> <span>{customer?.address || address || '(Không có địa chỉ)'}</span></div>
        </div>
      </div>
      <div className="order-detail-right">
        <div className="order-product-table">
          <table>
            <thead>
              <tr>
                <th style={{textAlign: 'left'}}>Sản phẩm</th>
                <th style={{textAlign: 'center'}}>Mã giảm giá</th>
                <th style={{textAlign: 'center'}}>Số lượng</th>
                <th style={{textAlign: 'right'}}>Giá</th>
                <th style={{textAlign: 'right'}}>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="product-info">
                    <img src={item.img_url || '/no-image.png'} alt={item.name} onError={e => (e.currentTarget.src = '/no-image.png')} />
                    <span>{item.name}</span>
                  </td>
                  <td className="coupon-code" style={{textAlign: 'center'}}>
                    {coupon_code ? <a>{coupon_code}</a> : <span className="coupon-dash">-</span>}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td className="product-price" style={{textAlign: 'right'}}>{formatMoney(item.price)}</td>
                  <td className="product-total" style={{textAlign: 'right'}}>{formatMoney(item.price * item.quantity)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}></td>
                <td style={{textAlign: 'right'}}>Giảm giá (%)</td>
                <td style={{ textAlign: "right" }}>{discount_percent ? discount_percent + '%' : '-'}</td>
              </tr>
              <tr>
                <td colSpan={3}></td>
                <td style={{textAlign: 'right'}}><b>Tổng</b></td>
                <td className="order-total-value" style={{textAlign: 'right'}}>{formatMoney(final_total || total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="order-detail-actions">
          <button className="delete-btn" onClick={handleDelete}>XOÁ ĐƠN HÀNG</button>
          <button className="back-btn" onClick={() => navigate('/admin/order')}>QUAY LẠI</button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
