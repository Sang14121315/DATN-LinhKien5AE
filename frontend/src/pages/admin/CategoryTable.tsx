import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus, FaChevronRight, FaChevronDown, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCategories, 
  fetchCategoriesHierarchy, 
  fetchParentCategoriesForDropdown,
  deleteCategory 
} from '@/api/categoryAPI';
import '@/styles/pages/admin/categoryTable.scss';

interface Category {
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  parent?: string | { _id: string; name: string; slug: string } | null;
  img_url?: string;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

interface ParentCategory {
  _id: string;
  name: string;
  slug: string;
}

const CategoryTable: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    name: string;
    parent: string; // '' = all, 'null' = parent only, parentId = children của parent đó
    startDate: string;
    endDate: string;
  }>({ name: '', parent: '', startDate: '', endDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Load parent categories cho dropdown filter
  useEffect(() => {
    const loadParentCategories = async () => {
      try {
        const data = await fetchParentCategoriesForDropdown();
        setParentCategories(data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục cha:', error);
      }
    };

    loadParentCategories();
  }, []);

  // Load categories data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (viewMode === 'tree') {
          // Tree view: load hierarchy
          const data = await fetchCategoriesHierarchy();
          setCategories(data);
        } else {
          // List view: load with filters
          const filterParams: any = {};
          if (filters.name) filterParams.name = filters.name;
          if (filters.parent) filterParams.parent = filters.parent;
          if (filters.startDate) filterParams.startDate = filters.startDate;
          if (filters.endDate) filterParams.endDate = filters.endDate;

          const data = await fetchCategories(filterParams);
          setCategories(data);
        }
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, viewMode]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const toggleParentExpand = (parentId: string) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const getParentName = (parent: string | { _id: string; name: string } | null | undefined) => {
    if (!parent) return '—';
    if (typeof parent === 'object' && parent.name) return parent.name;
    const found = parentCategories.find(p => p._id === parent);
    return found ? found.name : 'Không xác định';
  };

  const getCategoryType = (parent: any) => {
    return parent ? 'child' : 'parent';
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${categoryName}"?`)) {
      try {
        await deleteCategory(id);
        // Reload data after delete
        const filterParams: any = {};
        if (filters.name) filterParams.name = filters.name;
        if (filters.parent) filterParams.parent = filters.parent;
        if (filters.startDate) filterParams.startDate = filters.startDate;
        if (filters.endDate) filterParams.endDate = filters.endDate;

        const data = viewMode === 'tree' 
          ? await fetchCategoriesHierarchy()
          : await fetchCategories(filterParams);
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        setError('Không thể xóa danh mục. Vui lòng thử lại.');
      }
    }
  };

  // Render flat list for list view
  const renderListView = () => {
    const paginated = categories.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    return (
      <>
        <table className="category-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Mô tả</th>
              <th>Loại</th>
              <th>Danh mục cha</th>
              <th>Ngày tạo</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>Không tìm thấy danh mục nào.</td>
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
                  <td>{cat.slug}</td>
                  <td>{cat.description?.slice(0, 50) || '—'}{cat.description && cat.description.length > 50 ? '...' : ''}</td>
                  <td>
                    <span className={`type-badge ${getCategoryType(cat.parent)}`}>
                      {getCategoryType(cat.parent) === 'parent' ? 'Cha' : 'Con'}
                    </span>
                  </td>
                  <td>{getParentName(cat.parent)}</td>
                  <td>{cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-button"
                        onClick={() => navigate(`/admin/category/${cat._id}/form`)}
                        title="Xem chi tiết"
                      >
                        <FaEye /> Xem
                      </button>
                      {/* <button
                        className="edit-button"
                        onClick={() => navigate(`/admin/category/${cat._id}/form`)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button> */}
                      {/* <button
                        className="delete-button"
                        onClick={() => handleDelete(cat._id!, cat.name)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="pagination-btn"
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="pagination-btn"
            >
              Sau
            </button>
          </div>
        )}
      </>
    );
  };

  // Render tree structure for tree view
  const renderTreeView = () => {
    const renderTreeItem = (category: Category, level: number = 0) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedParents.has(category._id!);

      return (
        <React.Fragment key={category._id}>
          <tr className={`tree-row level-${level}`}>
            <td>
              <span className="id-link">
                #{category._id?.slice(-4).toUpperCase()}
              </span>
            </td>
            <td>
              <div className="tree-item" style={{ paddingLeft: `${level * 20}px` }}>
                {hasChildren && (
                  <button
                    className="expand-button"
                    onClick={() => toggleParentExpand(category._id!)}
                  >
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </button>
                )}
                <span className="category-name">
                  {category.name}
                </span>
              </div>
            </td>
            <td>{category.slug}</td>
            <td>{category.description?.slice(0, 50) || '—'}{category.description && category.description.length > 50 ? '...' : ''}</td>
            <td>
              <span className={`type-badge ${getCategoryType(category.parent)}`}>
                {getCategoryType(category.parent) === 'parent' ? 'Cha' : 'Con'}
              </span>
            </td>
            <td>{getParentName(category.parent)}</td>
            <td>{category.created_at ? new Date(category.created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
            <td>
              <div className="action-buttons">
                <button
                  className="view-button"
                  onClick={() => navigate(`/admin/category/${category._id}/form`)}
                  title="Xem chi tiết"
                >
                  <FaEye />
                </button>
                <button
                  className="edit-button"
                  onClick={() => navigate(`/admin/category/${category._id}/edit`)}
                  title="Chỉnh sửa"
                >
                  <FaEdit />
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(category._id!, category.name)}
                  title="Xóa"
                >
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
          
          {/* Render children if expanded */}
          {hasChildren && isExpanded && category.children!.map(child => 
            renderTreeItem(child, level + 1)
          )}
        </React.Fragment>
      );
    };

    return (
      <table className="category-table tree-view">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Slug</th>
            <th>Mô tả</th>
            <th>Loại</th>
            <th>Danh mục cha</th>
            <th>Ngày tạo</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={8}>Không tìm thấy danh mục nào.</td>
            </tr>
          ) : (
            categories.map(category => renderTreeItem(category))
          )}
        </tbody>
      </table>
    );
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="category-page-container">
      <div className="page-header">
        <h2 className="page-title">Quản lý Danh mục</h2>
        
        {/* View mode toggle */}
        {/* <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Danh sách
          </button>
          <button
            className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Cây danh mục
          </button>
        </div> */}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters - chỉ hiển thị trong list view */}
      {viewMode === 'list' && (
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Tìm kiếm:</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Tìm kiếm danh mục..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Loại danh mục:</label>
              <select
                name="parent"
                value={filters.parent}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tất cả</option>
                <option value="null">Danh mục cha</option>
                {parentCategories.map(parent => (
                  <option key={parent._id} value={parent._id}>
                    Con của: {parent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Từ ngày:</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Đến ngày:</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="action-bar">
        <div className="left-actions">
          <span className="total-count">
            Tổng cộng: {categories.length} danh mục
          </span>
        </div>
        
        <div className="right-actions">
          <button
            className="add-button primary"
            onClick={() => navigate('/admin/category/create')}
          >
            <FaPlus /> Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Table content */}
      {!loading && (
        <div className="table-container">
          {viewMode === 'list' ? renderListView() : renderTreeView()}
        </div>
      )}
    </div>
  );
};

export default CategoryTable;