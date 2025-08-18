import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchChildCategories, fetchParentCategories } from '@/api/categoryAPI';
// import { Category } from '@/types';
import '@/styles/pages/admin/categoryTable.scss';

interface ParentCategory {
  _id: string;
  name: string;
  slug: string;
}

const ChildCategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
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
    const loadParentCategories = async () => {
      try {
        const data = await fetchParentCategories();
        setParentCategories(data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục cha:', error);
      }
    };

    loadParentCategories();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchChildCategories(filters);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    };

    loadData();
  }, [filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const getParentName = (parent: string | { _id: string; name: string } | null | undefined) => {
    if (!parent) return 'Không có';
    if (typeof parent === 'object' && parent.name) return parent.name;
    // Nếu là string, tìm trong danh sách parentCategories
    const found = parentCategories.find(p => p._id === parent);
    return found ? found.name : 'Không xác định';
  };

  const paginated = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="category-page-container">
      <h2 className="page-title">Quản lý Danh mục con</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="top-controls">
        <div className="left-filters">
          <select
            name="parent"
            value={filters.parent}
            onChange={handleFilterChange}
            className="filter-button"
          >
            <option value="">Tất cả danh mục cha</option>
            {parentCategories.map(parent => (
              <option key={parent._id} value={parent._id}>
                {parent.name}
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
            placeholder="Tìm kiếm danh mục con..."
          />
          <button
            className="add-button"
            onClick={() => navigate('/admin/child-category/create')}
          >
            <FaPlus /> Thêm danh mục con
          </button>
        </div>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Danh mục con</th>
            <th>Danh mục cha</th>
            <th>Slug</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={8}>Không tìm thấy danh mục con nào.</td>
            </tr>
          ) : (
            paginated.map((cat, index) => (
              <tr key={cat._id}>
                <td>
                  <span className="id-link">
                    #{(currentPage - 1) * itemsPerPage + index + 1}
                  </span>
                </td>
                <td>
                  <div className="category-name">
                    {cat.name}
                  </div>
                </td>
                <td>
                  <span className="parent-category">
                    {getParentName(cat.parent)}
                  </span>
                </td>
                <td>{cat.slug}</td>
                <td>{cat.description?.slice(0, 40) || '...'}...</td>
                <td>{cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td><span className="status">Đã duyệt</span></td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/admin/child-category/${cat._id}/form`)}
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

export default ChildCategoryTable;