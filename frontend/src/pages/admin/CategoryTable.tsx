import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchAllCategories } from '@/api/categoryAPI';
import { Category } from '@/types';
import '@/styles/pages/admin/categoryTable.scss';

const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<{
    name: string;
    parent: string;
    startDate: string;
    endDate: string;
  }>({ name: '', parent: '', startDate: '', endDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Lấy tất cả danh mục để điền vào dropdown parent
        const allCategories = await fetchAllCategories({});
        console.log('All Categories:', allCategories); // Debug tất cả danh mục

        // Lọc danh mục cha (parent là null hoặc không tồn tại)
        const parents = allCategories.filter(cat => !cat.parent || cat.parent === null || (typeof cat.parent === 'object' && cat.parent === null));
        setParentCategories(parents);
        console.log('Parent Categories:', parents); // Debug danh mục cha

        // Lấy danh mục với bộ lọc
        const data = await fetchAllCategories(filters);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
        setError('Không thể tải danh mục. Vui lòng thử lại.');
      }
    };

    loadCategories();
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const paginated = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="category-page-container">
      <h2 className="page-title">Danh mục</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="top-controls">
        <div className="left-filters">
          <select
            name="parent"
            value={filters.parent}
            onChange={handleFilterChange}
            className="filter-button"
          >
            <option value="">Tất cả danh mục</option>
            <option value="null">Không có danh mục cha</option>
            {parentCategories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
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
            placeholder="Tìm kiếm danh mục..."
          />
          <button
            className="add-button"
            onClick={() => navigate('/admin/category/create')}
          >
            <FaPlus /> Thêm danh mục
          </button>
        </div>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Danh mục</th>
            <th>Mô tả</th>
            <th>Ngày</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={6}>Không tìm thấy danh mục nào.</td>
            </tr>
          ) : (
            paginated.map((cat, index) => (
              <tr key={cat._id}>
                <td>
                  <span className="id-link">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </td>
                <td>{cat.name}</td>
                <td>{cat.description?.slice(0, 20) || '...'}...</td>
                <td>{cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td><span className="status">Đã duyệt</span></td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/admin/category/${cat._id}/form`)}
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

export default CategoryTable;