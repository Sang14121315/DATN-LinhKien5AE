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
  const couponsPerPage = 5;

  const navigate = useNavigate();

  const loadCoupons = async () => {
    const data = await fetchCoupons();
    setCoupons(data);
    setFilteredCoupons(data);
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
    } else {
      const newCoupon = await createCouponAPI(payload);
      setCoupons((prev: any[]) => [newCoupon, ...prev]);
    }

    setFormData(defaultForm);
    setEditingId(null);
    await loadCoupons();
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
      loadCoupons();
    }
  };

  // Sắp xếp coupon mới nhất lên đầu (ưu tiên created_at, fallback start_date)
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(a.start_date);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(b.start_date);
    return dateB.getTime() - dateA.getTime();
  });

  const paginatedCoupons = sortedCoupons.slice((currentPage - 1) * couponsPerPage, currentPage * couponsPerPage);

  return (
    <div className="admin-coupon-wrapper">
      <div className="coupon-header-bar" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
        <form className="filter-controls-horizontal" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
          <input
            type="text"
            name="code"
            value={filters.code}
            onChange={handleFilterChange}
            placeholder="Nhập mã để tìm kiếm..."
            style={{ minWidth: 160 }}
          />
          <select name="discount_type" value={filters.discount_type} onChange={handleFilterChange}>
            <option value="">Tất cả loại</option>
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Cố định</option>
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
          <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
        </form>
        <button className="add-coupon-btn" onClick={() => navigate('/admin/coupons/create')} style={{ height: 40, padding: '0 24px', fontWeight: 600, background: '#0056b3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Thêm mã giảm giá</button>
      </div>
      <div className="admin-coupon-inner">
        <div className="admin-coupon-page">
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>🎟️ Quản lý mã giảm giá</h2>

          {/* Header cho danh sách card */}
          <div className="coupon-card-list-header">
            <span className="col-id">#</span>
            <span className="col-code">Mã</span>
            <span className="col-type">Loại</span>
            <span className="col-value">Giá trị</span>
            <span className="col-min">Đơn tối thiểu</span>
            <span className="col-start">Ngày bắt đầu</span>
            <span className="col-end">Ngày kết thúc</span>
            <span className="col-status">Trạng thái</span>
            <span className="col-actions">Hành động</span>
          </div>

          {/* Danh sách mã giảm giá dạng card hàng dọc */}
          <div className="coupon-card-list vertical-list">
            {paginatedCoupons.map((coupon, idx) => (
              <div className="coupon-card row-card" key={coupon._id}>
                <span className="col-id" style={{ color: '#00b96b', fontWeight: 700 }}>{(currentPage - 1) * couponsPerPage + idx + 1}</span>
                <span className="col-code">{coupon.code}</span>
                <span className="col-type">{coupon.discount_type}</span>
                <span className="col-value">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `${coupon.discount_value.toLocaleString()}₫`}</span>
                <span className="col-min">{coupon.min_order_value?.toLocaleString()}₫</span>
                <span className="col-start">{new Date(coupon.start_date).toLocaleDateString()}</span>
                <span className="col-end">{new Date(coupon.end_date).toLocaleDateString()}</span>
                <span className="col-status">
                  <span className={coupon.is_active ? "status" : "status inactive"}>
                    {coupon.is_active ? "Đã duyệt" : "Ẩn"}
                  </span>
                </span>
                <span className="col-actions">
                  <button className="view-button" onClick={() => handleEdit(coupon)}>
                    <FaEye /> Xem
                  </button>
                </span>
              </div>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
            <div className="coupon-table-summary" style={{fontSize: 14, color: '#888', paddingLeft: 2}}>
              Showing {(currentPage - 1) * couponsPerPage + 1}-{Math.min(currentPage * couponsPerPage, sortedCoupons.length)} from {sortedCoupons.length}
            </div>
            <div className="pagination-controls pagination-right">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{'<'}</button>
              {Array.from({ length: Math.ceil(sortedCoupons.length / couponsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-number${page === currentPage ? ' active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  disabled={page === currentPage}
                  style={{fontSize: 14}}
                >
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedCoupons.length / couponsPerPage), p + 1))} disabled={currentPage === Math.ceil(sortedCoupons.length / couponsPerPage)}>{'>'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCouponPage;