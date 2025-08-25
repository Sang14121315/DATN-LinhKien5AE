// AdminOrderPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '@/api/orderAPI';
import { sendOrderStatusUpdateEmail } from '@/services/emailService';
import '@/styles/pages/admin/orderList.scss';
import { FaEye } from "react-icons/fa";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customer: {
    name: string;
    phone: string;
  };
  total: number;
  status: string;
  created_at: string;
  updated_at: string; // Added updated_at
  items: OrderItem[];
}

const AdminOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    totalFrom: '',
    totalTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', dateFrom: '', dateTo: '', totalFrom: '', totalTo: '' });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Tìm đơn hàng hiện tại để lấy thông tin
      const currentOrder = orders.find(o => o._id === orderId);
      if (!currentOrder) {
        console.error('❌ Không tìm thấy đơn hàng!');
        return;
      }

      const canonicalizeStatus = (status: string) => {
        if (status === 'cancelled') return 'canceled';
        if (status === 'delivered') return 'completed';
        return status;
      };

      const allowedTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'canceled', 'paid', 'processing'],
        confirmed: ['shipping', 'canceled'],
        paid: ['confirmed', 'shipping'],
        processing: ['confirmed', 'shipping', 'canceled'],
        shipping: ['completed'],
        completed: [],
        canceled: []
      };

      const oldStatus = canonicalizeStatus(currentOrder.status);
      const requestedStatus = canonicalizeStatus(newStatus);

      if (oldStatus === 'completed' || oldStatus === 'canceled') {
        console.warn('❌ Đơn hàng đã kết thúc, không thể cập nhật trạng thái');
        return;
      }

      if (requestedStatus === oldStatus) {
        console.warn('⚠️ Trạng thái mới phải khác trạng thái hiện tại');
        return;
      }

      const nextStatuses = allowedTransitions[oldStatus] || [];
      if (!nextStatuses.includes(requestedStatus)) {
        console.warn(`❌ Chuyển trạng thái không hợp lệ: từ "${oldStatus}" chỉ có thể sang ${nextStatuses.length ? nextStatuses.map(s => `"${s}"`).join(', ') : 'không trạng thái nào'}`);
        return;
      }
      
      // Cập nhật trạng thái trong database
      await updateOrderStatus(orderId, requestedStatus);
      
      // Cập nhật state và reload danh sách để đảm bảo sort đúng
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      
      // Gửi email thông báo từ frontend
      try {
        console.log('📧 Sending status update email from frontend...');
        const emailResult = await sendOrderStatusUpdateEmail(currentOrder, oldStatus, newStatus);
        
        if (emailResult.success) {
          console.log('✅ Status update email sent successfully from frontend!');
        } else {
          console.error('❌ Failed to send status update email from frontend:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending status update email from frontend:', emailError);
        // Không dừng quá trình cập nhật nếu email thất bại
      }
      
      // Hiển thị thông báo thành công
      const statusText = {
        'pending': 'Chờ xử lý',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',  
        'completed': 'Đã giao hàng',
        'canceled': 'Đã hủy',
        'paid': 'Đã thanh toán',
        'processing': 'Đang xử lý'
      }[requestedStatus] || requestedStatus;
      console.log(`✅ Đã cập nhật trạng thái đơn hàng thành "${statusText}"`);
    } catch (err) {
      console.error('❌ Cập nhật trạng thái thất bại!', err);
    }
  };

  const canonicalizeStatus = (status: string) => {
    if (status === 'cancelled') return 'canceled';
    if (status === 'delivered') return 'completed';
    return status;
  };

  const allowedTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'canceled', 'paid', 'processing'],
    confirmed: ['shipping', 'canceled'],
    paid: ['confirmed', 'shipping'],
    processing: ['confirmed', 'shipping', 'canceled'],
    shipping: ['completed'],
    completed: [],
    canceled: []
  };

  const getStatusLabel = (s: string) => ({
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Đã giao hàng',
    canceled: 'Đã hủy',
    paid: 'Đã thanh toán',
    processing: 'Đang xử lý'
  } as Record<string, string>)[s] || s;

  const filteredOrders = orders.filter(order => {
    // Search by customer name or phone
    const searchMatch =
      filters.search === '' ||
      order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.phone.includes(filters.search);
    // Status
    const statusMatch = !filters.status || order.status === filters.status;
    // Date range
    const orderDate = new Date(order.created_at);
    const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
    const dateMatch =
      (!fromDate || orderDate >= fromDate) &&
      (!toDate || orderDate <= toDate);
    // Total range
    const totalFrom = filters.totalFrom ? parseInt(filters.totalFrom) : null;
    const totalTo = filters.totalTo ? parseInt(filters.totalTo) : null;
    const totalMatch =
      (!totalFrom || order.total >= totalFrom) &&
      (!totalTo || order.total <= totalTo);
    return searchMatch && statusMatch && dateMatch && totalMatch;
  });

  // Sắp xếp: ưu tiên updated_at, sau đó đến created_at
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : -Infinity;
    const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : -Infinity;
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : -Infinity;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : -Infinity;
    return bCreated - aCreated;
  });

  const totalOrders = sortedOrders.length;
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  return (
    <div className="admin-orders">
      <h2>📦 Quản lý đơn hàng</h2>
      {/* Bộ lọc */}
      <form className="order-filter-form" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Tìm tên hoặc SĐT khách hàng"
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Đã giao hàng</option>
          <option value="canceled">Đã hủy</option>
          <option value="paid">Đã thanh toán</option>
          <option value="processing">Đang xử lý</option>
        </select>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          placeholder="Từ ngày"
        />
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          placeholder="Đến ngày"
        />
        <input
          type="number"
          name="totalFrom"
          value={filters.totalFrom}
          onChange={handleFilterChange}
          placeholder="Tổng từ (₫)"
          min="0"
        />
        <input
          type="number"
          name="totalTo"
          value={filters.totalTo}
          onChange={handleFilterChange}
          placeholder="Tổng đến (₫)"
          min="0"
        />
        <button type="button" onClick={handleClearFilters} className="clear-filter-btn">Xóa lọc</button>
      </form>
      {/* Danh sách đơn hàng */}
      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : (
        <>
          <table className="order-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Ngày đặt</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, index) => (
                <tr key={order._id}>
                  <td>{(currentPage - 1) * ordersPerPage + index + 1}</td>
                  <td>
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                    {order.items.length > 2 && <div>...và {order.items.length - 2} sản phẩm khác</div>}
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </div>
                      {order.updated_at && order.updated_at !== order.created_at && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          Cập nhật: {new Date(order.updated_at).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{order.customer.name}</td>
                  <td>{order.total.toLocaleString()}₫</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        className={`status-label ${order.status}`}
                        style={{ minWidth: 140 }}
                      >
                      {(() => {
                        const current = canonicalizeStatus(order.status);
                        const nexts = allowedTransitions[current] || [];
                        const options = [current, ...nexts];
                        const uniqueOptions = Array.from(new Set(options));
                        return uniqueOptions.map(s => (
                          <option key={s} value={s} disabled={s === current}>
                            {getStatusLabel(s)}
                          </option>
                        ));
                      })()}
                        </select>
                      </div>
                    </td>
                  <td>
                    <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="view-btn">
                      <FaEye /> Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-table-summary">
            Showing {(currentPage - 1) * ordersPerPage + 1}
            -{Math.min(currentPage * ordersPerPage, totalOrders)} from {totalOrders}
          </div>
          <div className="pagination-controls pagination-right">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{'<'}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(page => (
              <button
                key={page}
                className={`page-number${page === currentPage ? ' active' : ''}`}
                onClick={() => setCurrentPage(page)}
                disabled={page === currentPage}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages - 2 && <span>...</span>}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{'>'}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrderPage;
