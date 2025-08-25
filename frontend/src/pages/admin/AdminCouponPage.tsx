import React, { useEffect, useState } from "react";
import {
  fetchCoupons,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI,
} from "@/api/couponAPI";
import "@/styles/pages/admin/couponPage.scss";
import { useNavigate } from "react-router-dom";
import { FaEye } from 'react-icons/fa';

const defaultForm = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_value: 0,
  start_date: "",
  end_date: "",
  max_uses: 1,
  is_active: true,
};

const AdminCouponPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    code: "",
    discount_type: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [couponsPerPage, setCouponsPerPage] = useState(5);

  const navigate = useNavigate();

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    console.log('Loaded coupons:', data);
    setCoupons(data);
    setFilteredCoupons(data);
    setCurrentPage(1); // Reset về trang đầu tiên khi load lại dữ liệu
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...coupons];

    // Filter by code
    if (filters.code) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(filters.code.toLowerCase())
      );
    }

    // Filter by discount type
    if (filters.discount_type) {
      filtered = filtered.filter(coupon =>
        coupon.discount_type === filters.discount_type
      );
    }

    // Filter by status
    if (filters.status !== "") {
      const isActive = filters.status === "active";
      filtered = filtered.filter(coupon => coupon.is_active === isActive);
    }

    // Filter by date range
    if (filters.date_from) {
      filtered = filtered.filter(coupon =>
        new Date(coupon.start_date) >= new Date(filters.date_from)
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(coupon =>
        new Date(coupon.end_date) <= new Date(filters.date_to)
      );
    }

    setFilteredCoupons(filtered);
    // Reset về trang đầu tiên khi filter thay đổi
    setCurrentPage(1);
    
    // Debug log
    console.log('Filters:', filters);
    console.log('Filtered coupons:', filtered.length);
  }, [coupons, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      code: "",
      discount_type: "",
      status: "",
      date_from: "",
      date_to: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      discount_value: Number(formData.discount_value),
      min_order_value: Number(formData.min_order_value),
      max_uses: Number(formData.max_uses),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    if (editingId) {
      await updateCouponAPI(editingId, payload);
      // Sau khi cập nhật, reload danh sách và reset về trang đầu
      await loadCoupons();
      setCurrentPage(1);
    } else {
      const newCoupon = await createCouponAPI(payload);
      // Thêm coupon mới vào đầu danh sách và reset về trang đầu
      setCoupons((prev: any[]) => [newCoupon, ...prev]);
      setCurrentPage(1);
    }

    setFormData(defaultForm);
    setEditingId(null);
  } catch (err: any) {
    console.error("❌ Lỗi khi lưu mã giảm giá:", err);
    alert(err?.response?.data?.message || "Lỗi khi lưu mã giảm giá");
  }
};


  const handleEdit = (coupon: any) => {
    navigate(`/admin/coupons/${coupon._id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xoá mã này không?")) {
      await deleteCouponAPI(id);
      await loadCoupons();
      // Nếu trang hiện tại trống sau khi xóa, reset về trang đầu
      const remainingCoupons = coupons.filter(coupon => coupon._id !== id);
      const totalPagesAfterDelete = Math.ceil(remainingCoupons.length / couponsPerPage);
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }
    }
  };

  // Sắp xếp: ưu tiên updated_at, sau đó đến created_at, cuối cùng fallback start_date
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : -Infinity;
    const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : -Infinity;
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : -Infinity;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : -Infinity;
    if (aCreated !== bCreated) return bCreated - aCreated;

    const aStart = a.start_date ? new Date(a.start_date).getTime() : -Infinity;
    const bStart = b.start_date ? new Date(b.start_date).getTime() : -Infinity;
    return bStart - aStart;
  });

  const totalCoupons = sortedCoupons.length;
  const totalPages = Math.ceil(totalCoupons / couponsPerPage);
  const paginatedCoupons = sortedCoupons.slice((currentPage - 1) * couponsPerPage, currentPage * couponsPerPage);

  return (
    <div className="admin-coupon-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Quản lý mã giảm giá</h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-section">
        <div className="filter-controls">
          <input
            type="text"
            name="code"
            value={filters.code}
            onChange={handleFilterChange}
            placeholder="Tìm mã giảm giá..."
            className="search-input"
          />
          <select name="discount_type" value={filters.discount_type} onChange={handleFilterChange} className="status-select">
            <option value="">Tất cả loại</option>
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Cố định</option>
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="status-select">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="date-input" />
          <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="date-input" />
          <button 
            className="add-coupon-btn" 
            onClick={() => navigate('/admin/coupons/create')}
            style={{
              height: '40px',
              padding: '0 20px',
              border: '2px solid #2EC4B6',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#FFFFFF',
              color: '#2EC4B6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              lineHeight: '40px',
              margin: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Thêm mã giảm giá
          </button>
        </div>
      </div>

      {/* Coupon Table */}
      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã giảm giá</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCoupons.map((coupon, idx) => (
              <tr key={coupon._id}>
                <td>{(currentPage - 1) * couponsPerPage + idx + 1}</td>
                <td className="product-cell">{coupon.code}</td>
                <td>
                  <span className={`discount-type ${coupon.discount_type}`}>
                    {coupon.discount_type === "percentage" ? "Phần trăm" : "Số Tiền"}
                  </span>
                </td>
                <td className="total-cell">
                  {coupon.discount_type === "percentage" 
                    ? `${coupon.discount_value}%` 
                    : `${coupon.discount_value.toLocaleString()}₫`
                  }
                </td>
                <td>
                  {coupon.min_order_value ? (
                    <span style={{ color: '#000000', fontWeight: '500' }}>
                      {coupon.min_order_value.toLocaleString()}₫
                    </span>
                  ) : (
                    <span style={{ color: '#00000', fontSize: '15px' }}>
                      Không giới hạn
                    </span>
                  )}
                </td>
                <td>{new Date(coupon.start_date).toLocaleDateString('vi-VN')}</td>
                <td>{new Date(coupon.end_date).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="status-dropdown">
                    <span className={`status-badge ${coupon.is_active ? 'pending' : 'delivered'}`}>
                      {coupon.is_active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                    <span className="dropdown-arrow"></span>
                  </div>
                </td>
                <td>
                  <button 
                    className="view-btn"
                    onClick={() => handleEdit(coupon)}
                  >
                    <FaEye /> Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="order-table-summary">
        Showing {(currentPage - 1) * couponsPerPage + 1}
        -{Math.min(currentPage * couponsPerPage, totalCoupons)} from {totalCoupons}
      </div>
      <div className="pagination-controls pagination-right">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
        >
          ‹
        </button>
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
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default AdminCouponPage;