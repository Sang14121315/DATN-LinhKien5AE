import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, deleteOrderAPI } from "@/api/orderAPI";
import "@/styles/pages/admin/orderDetail.scss";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaTrash, FaArrowLeft } from 'react-icons/fa';

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Đã giao hàng';
      case 'canceled': return 'Đã hủy';
      default: return 'Chờ xử lý';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'shipping': return 'shipping';
      case 'completed': return 'completed';
      case 'canceled': return 'canceled';
      default: return 'pending';
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>Đang tải chi tiết đơn hàng...</p>
    </div>
  );
  
  if (!orderData) return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      gap: '16px',
      textAlign: 'center'
    }}>
      <p style={{ color: '#666', fontSize: '16px', marginBottom: '16px' }}>Không tìm thấy đơn hàng</p>
      <button 
        style={{
          background: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => navigate('/admin/order')}
      >
        <FaArrowLeft /> QUAY LẠI
      </button>
    </div>
  );

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
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#333' }}>
            Chi tiết đơn hàng #{_id}
          </h1>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: (() => {
              switch (status) {
                case 'completed': return '#d4edda';
                case 'shipping': return '#cce5ff';
                case 'canceled': return '#f8d7da';
                default: return '#fff3cd';
              }
            })(),
            color: (() => {
              switch (status) {
                case 'completed': return '#155724';
                case 'shipping': return '#004085';
                case 'canceled': return '#721c24';
                default: return '#856404';
              }
            })()
          }}>
            {getStatusText(status)}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#666',
          fontSize: '14px'
        }}>
          <FaCalendarAlt style={{ color: '#999' }} />
          <span>Ngày đặt: {created_at ? new Date(created_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Left Column - Order Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '8px'
            }}>Thông tin đơn hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaMoneyBillWave style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: '14px', minWidth: '140px' }}>Phương thức thanh toán:</span>
                <strong style={{ color: '#333', fontWeight: '600' }}>
                  {payment_method === 'cod' ? 'Tiền mặt' : 'Chuyển khoản'}
                </strong>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaCalendarAlt style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: '14px', minWidth: '140px' }}>Ngày đặt hàng:</span>
                <strong style={{ color: '#333', fontWeight: '600' }}>
                  {created_at ? new Date(created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '8px'
            }}>Thông tin khách hàng</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaUser style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: '14px', minWidth: '140px' }}>Tên khách hàng:</span>
                <strong style={{ color: '#333', fontWeight: '600' }}>
                  {customer?.name || 'Chưa có tên'}
                </strong>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaEnvelope style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: '14px', minWidth: '140px' }}>Email:</span>
                <strong style={{ color: '#333', fontWeight: '600' }}>
                  {customer?.email || 'Chưa có email'}
                </strong>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaPhone style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0 }} />
                <span style={{ color: '#666', fontSize: '14px', minWidth: '140px' }}>Điện thoại:</span>
                <strong style={{ color: '#333', fontWeight: '600' }}>
                  {customer?.phone || 'Chưa có số'}
                </strong>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '8px 0'
              }}>
                <FaMapMarkerAlt style={{ width: '16px', height: '16px', color: '#666', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Địa chỉ:</span>
                  <strong style={{ color: '#333', fontWeight: '600', lineHeight: '1.4' }}>
                    {customer?.address || address || 'Chưa có địa chỉ'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Products */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '8px'
            }}>Sản phẩm đã đặt</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6'
                    }}>Sản phẩm</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6'
                    }}>Mã giảm giá</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6'
                    }}>Số lượng</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6'
                    }}>Đơn giá</th>
                    <th style={{
                      background: '#f8f9fa',
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '2px solid #dee2e6'
                    }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px 8px', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <img 
                            src={item.img_url || '/no-image.png'} 
                            alt={item.name} 
                            onError={e => (e.currentTarget.src = '/no-image.png')}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              background: '#f8f9fa'
                            }}
                          />
                          <div>
                            <div style={{
                              fontWeight: '600',
                              color: '#333',
                              marginBottom: '2px'
                            }}>{item.name}</div>
                            <div style={{
                              fontSize: '12px',
                              color: '#666'
                            }}>SKU: {item.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '12px 8px', 
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'center'
                      }}>
                        {coupon_code ? (
                          <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>{coupon_code}</span>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>-</span>
                        )}
                      </td>
                      <td style={{ 
                        padding: '12px 8px', 
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#333'
                      }}>{item.quantity}</td>
                      <td style={{ 
                        padding: '12px 8px', 
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#28a745'
                      }}>{formatMoney(item.price)}</td>
                      <td style={{ 
                        padding: '12px 8px', 
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#dc3545'
                      }}>{formatMoney(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: '#f8f9fa' }}>
                  <tr>
                    <td colSpan={3}></td>
                    <td style={{
                      padding: '12px 8px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#333'
                    }}>Giảm giá:</td>
                    <td style={{
                      padding: '12px 8px',
                      textAlign: 'right',
                      color: '#28a745',
                      fontWeight: '600'
                    }}>
                      {discount_percent ? `${discount_percent}%` : '0%'}
                    </td>
                  </tr>
                  <tr style={{ background: '#e9ecef' }}>
                    <td colSpan={3}></td>
                    <td style={{
                      padding: '12px 8px',
                      textAlign: 'right',
                      fontWeight: '700',
                      color: '#333',
                      fontSize: '16px'
                    }}>Tổng cộng:</td>
                    <td style={{
                      padding: '12px 8px',
                      textAlign: 'right',
                      color: '#dc3545',
                      fontWeight: '700',
                      fontSize: '18px'
                    }}>
                      {formatMoney(final_total || total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: '#dc3545',
            color: 'white'
          }}
          onClick={handleDelete}
        >
          <FaTrash style={{ width: '14px', height: '14px' }} />
          XOÁ ĐƠN HÀNG
        </button>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: '#6c757d',
            color: 'white'
          }}
          onClick={() => navigate('/admin/order')}
        >
          <FaArrowLeft style={{ width: '14px', height: '14px' }} />
          QUAY LẠI
        </button>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
