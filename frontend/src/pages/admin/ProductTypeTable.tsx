import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchAllProductTypes,ProductType } from '@/api/productTypeAPI';
import '@/styles/pages/admin/productTypeTable.scss';

const ProductTypeTable: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    name: string;
    category_id: string;
    startDate: string;
    endDate: string;
    status: string; // Thêm trạng thái
  }>({
    name: '',
    category_id: '',
    startDate: '',
    endDate: '',
    status: '', // Thêm trạng thái
  });

  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        // Lấy toàn bộ danh sách để lọc loại sản phẩm
        const allData = await fetchAllProductTypes({});
        setAllProductTypes(allData);

        // Lấy loại sản phẩm theo bộ lọc
        const data = await fetchAllProductTypes({}); // luôn lấy tất cả, filter phía client
        let filtered = data;
        // Lọc theo loại sản phẩm (category_id là _id của loại)
        if (filters.category_id) {
          filtered = filtered.filter((item: any) => item._id === filters.category_id);
        }
        // Lọc theo trạng thái
        if (filters.status) {
          filtered = filtered.filter((item: any) => {
            if (filters.status === 'active') return item.is_active !== false;
            if (filters.status === 'inactive') return item.is_active === false;
            return true;
          });
        }
        // Lọc theo tên
        if (filters.name) {
          filtered = filtered.filter((item: any) => item.name.toLowerCase().includes(filters.name.toLowerCase()));
        }
        setProductTypes(filtered);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải loại sản phẩm:', err);
        setError('Không thể tải danh sách loại sản phẩm. Vui lòng thử lại.');
      }
    };

    loadProductTypes();
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset trang về đầu
  };

  const paginated = productTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(productTypes.length / itemsPerPage);



  return (
    <div className="product-type-page-container">
      <h2 className="page-title">Loại sản phẩm</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="top-controls">
        <div className="left-filters" style={{ flex: 1, minWidth: 0 }}>
          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            className="filter-button"
          >
            <option value="">Tất cả loại sản phẩm</option>
            {allProductTypes.map(productType => (
              <option key={productType._id} value={productType._id}>
                {productType.name}
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
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-button"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đã duyệt</option>
            <option value="inactive">Chưa duyệt</option>
          </select>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Tìm kiếm loại sản phẩm..."
            style={{ width: 220, marginLeft: 8 }}
          />
        </div>
        <div className="right-controls" style={{ flexShrink: 0 }}>
          <button
            className="add-button"
            onClick={() => navigate('/admin/product-types/create')}
          >
            <FaPlus /> Thêm
          </button>
        </div>
      </div>

      <table className="product-type-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Loại sản phẩm</th>
            <th>Ngày</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={5}>Không tìm thấy loại sản phẩm nào.</td>
            </tr>
          ) : (
            paginated.map((productType, index) => (
              <tr key={productType._id}>
                <td>
                  <span className="id-link">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </td>
                <td>{productType.name}</td>
                <td>
                  {productType.created_at
                    ? new Date(productType.created_at).toLocaleDateString('vi-VN')
                    : ''}
                </td>
                <td>
                  <span className="status">Đã duyệt</span>
                </td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/admin/product-types/${productType._id}/form`)}
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

export default ProductTypeTable; 