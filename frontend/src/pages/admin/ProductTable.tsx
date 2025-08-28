import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@/styles/pages/admin/products.scss';

import { Product, fetchAllProducts, ProductQueryParams, formatCurrency, ProductListResponse } from '@/api/productAPI';
import { fetchCategories, Category } from '@/api/categoryAPI';
import { fetchAllBrands, Brand } from '@/api/brandAPI';
import { fetchAllProductTypes } from '@/api/productTypeAPI';

const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [/* types */, setTypes] = useState<unknown[]>([]);
  const [filters, setFilters] = useState<ProductQueryParams>({});
  const [search, setSearch] = useState('');
  const [/* error */, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const location = useLocation();

  const getImageUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/products/${url}`;
  };

  const loadProducts = async () => {
    try {
      const data = await fetchAllProducts({ ...filters, name: search });
      let productList: Product[] = [];
      if (Array.isArray(data as unknown as Product[])) {
        productList = data as unknown as Product[];
      } else if (Array.isArray((data as unknown as ProductListResponse)?.products)) {
        productList = (data as unknown as ProductListResponse).products;
      }

      const { state } = location;
      if (state?.updatedProduct || state?.newProduct) {
        const updated = state.updatedProduct || state.newProduct;
        productList = [
          updated,
          ...productList.filter(p => p._id !== updated._id)
        ];
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        productList.sort((a, b) => {
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
      }

      setProducts(productList);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
    }
  };

  const loadFilters = async () => {
    try {
      const [cats, brs, tys] = await Promise.all([
        fetchCategories({}),
        fetchAllBrands({}),
        fetchAllProductTypes({})
      ]);
      setCategories(cats);
      setBrands(brs);
      setTypes(tys);
    } catch (err) {
      console.error('Lỗi tải bộ lọc:', err);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, search]);

  const handleFilterChange = (name: keyof ProductQueryParams, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value || undefined }));
    setCurrentPage(1);
  };

  const paginated = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="products-page">
      <h1>Sản phẩm</h1>

      <div className="filters">
        <div className="filter-group">
          <select onChange={e => handleFilterChange('category_id', e.target.value)}>
            <option value="">Danh mục</option>
            {categories.map((cat: Category) => (
              <option key={cat._id || cat.slug} value={cat._id || ''}>{cat.name}</option>
            ))}
          </select>

          <select onChange={e => handleFilterChange('brand_id', e.target.value)}>
            <option value="">Thương hiệu</option>
            {brands.map((brand: Brand) => (
              <option key={brand._id} value={brand._id}>{brand.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button className="add-button" onClick={() => navigate('/admin/products/create')}>
          ＋ Thêm
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá gốc</th>
            <th>Giá giảm</th>
            <th>Ngày</th>
            <th>Số lượng</th>
            <th>Danh mục</th>
            <th>Thương hiệu</th>
            <th>Hot</th>
            <th>Trạng thái</th>
            <th>Chức năng</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length > 0 ? (
            paginated.map((product) => (
              <tr key={product._id}>
                <td className="product-cell">
                  <div className="image-placeholder">
                    {product.img_url && (
                      <img src={getImageUrl(product.img_url)} alt={product.name} />
                    )}
                  </div>
                  <span>{product.name}</span>
                </td>
                <td>{formatCurrency(product.price)}</td>
                <td>
                  {product.sale && product.sale > 0 && product.price > 0
                    ? formatCurrency(Math.max(product.price - product.sale, 0))
                    : '—'}
                </td>
                <td>{product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                <td>{product.stock}</td>
                <td>{(product.category_id as { _id: string; name: string } | string as unknown as { name?: string })?.name || '—'}</td>
                <td>{(product.brand_id as { _id: string; name: string } | string as unknown as { name?: string })?.name || '—'}</td>
                <td>{(product as unknown as { hot?: boolean }).hot ? '✔️' : '—'}</td>
                <td><span className="status approved">Đã duyệt</span></td>
                <td>
                  <button className="view-btn" onClick={() => navigate(`/admin/products/${product._id}/form`)}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 6 }}
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#e74c3c" strokeWidth="2"/>
                    </svg>
                    Xem
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={9}>Không có sản phẩm.</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <span>Hiển thị {paginated.length} / {products.length} sản phẩm</span>
        <div className="pages">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;