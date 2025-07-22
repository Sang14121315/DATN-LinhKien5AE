import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchAllBrands } from '@/api/brandAPI';
import { Brand } from '@/types/Product';
import '@/styles/pages/admin/brandTable.scss';

const BrandTable: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [parentBrands, setParentBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    name: string;
    parent: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    parent: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const loadBrands = async () => {
      try {
        // Debug: Kiểm tra token
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        
        // Debug: Kiểm tra user info
        const userInfo = localStorage.getItem('user');
        console.log('User Info:', userInfo);
        
        // Debug: Parse user info để xem role
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo);
            console.log('User Role:', user.role);
            console.log('User Email:', user.email);
          } catch (e) {
            console.log('User info không phải JSON format');
          }
        }
        
        if (!token) {
          setError('Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
          return;
        }
        
        // Lấy toàn bộ danh sách để lọc thương hiệu cha
        const allBrands = await fetchAllBrands({});
        const parents = allBrands.filter(
          brand =>
            !brand.parent ||
            brand.parent === null ||
            (typeof brand.parent === 'object' && brand.parent === null)
        );
        setParentBrands(parents);

        // Lấy thương hiệu theo bộ lọc
        const data = await fetchAllBrands(filters);
        setBrands(data);
        setError(null);
      } catch (err: any) {
        console.error('Lỗi chi tiết:', err);
        console.error('Response data:', err.response?.data);
        console.error('Status:', err.response?.status);
        
        if (err.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Có thể redirect về trang login
          // navigate('/login');
        } else if (err.response?.status === 403) {
          setError('Bạn không có quyền truy cập admin. Vui lòng đăng nhập với tài khoản admin.');
        } else {
          setError(`Không thể tải danh sách thương hiệu: ${err.response?.data?.message || err.message}`);
        }
      }
    };

    loadBrands();
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset trang về đầu
  };

  const paginated = brands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(brands.length / itemsPerPage);

  const getLogoUrl = (brand: Brand): string => {
    // Ưu tiên hiển thị logo_data (base64) nếu có
    if (brand.logo_data) {
      return brand.logo_data;
    }
    
    // Fallback về logo_url nếu không có logo_data
    if (!brand.logo_url) return '';
    if (brand.logo_url.startsWith('http')) return brand.logo_url;
    if (brand.logo_url.startsWith('/uploads/brands/')) {
      return `http://localhost:5000${brand.logo_url}`;
    }
    return `http://localhost:5000/uploads/brands/${brand.logo_url}`;
  };

  return (
    <div className="category-page-container">
      <h2 className="page-title">Thương hiệu</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="top-controls">
        <div className="left-filters">
          <select
            name="parent"
            value={filters.parent}
            onChange={handleFilterChange}
            className="filter-button"
          >
            <option value="">Tất cả thương hiệu</option>
            {parentBrands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="filter-button"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="filter-button"
          />
        </div>

        <div className="right-controls">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Tìm kiếm thương hiệu..."
          />
          <button
            className="add-button"
            onClick={() => navigate('/admin/brand/create')}
          >
            <FaPlus /> Thêm thương hiệu
          </button>
        </div>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Thương hiệu</th>
            <th>Logo</th>
            <th>Ngày</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6}>Không tìm thấy thương hiệu nào.</td>
            </tr>
          ) : (
            paginated.map((brand, index) => (
              <tr key={brand._id}>
                <td>
                  <span className="id-link">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </td>
                <td>{brand.name}</td>
                <td>
                  {getLogoUrl(brand) ? (
                    <img
                      src={getLogoUrl(brand)}
                      alt={brand.name}
                      style={{ width: 80, height: 40, objectFit: 'contain' }}
                    />
                  ) : (
                    <span>Không có</span>
                  )}
                </td>
                <td>
                  {brand.created_at
                    ? new Date(brand.created_at).toLocaleDateString('vi-VN')
                    : ''}
                </td>
                <td>
                  <span className="status">Đã duyệt</span>
                </td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/admin/brand/${brand._id}/form`)}
                  >
                    <FaEye /> Xem
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandTable;
