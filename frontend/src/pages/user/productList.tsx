import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaShoppingCart, FaRegHeart, FaHeart } from "react-icons/fa";
import { Row, Col, Grid, Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "@/styles/pages/user/productList.scss";
import axios from "axios";

import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import { Product, fetchFilteredProducts } from "@/api/user/productAPI";
import { Brand, fetchAllBrands } from "@/api/user/brandAPI";
import { Category, fetchCategoriesHierarchy } from "@/api/user/categoryAPI";

// Thêm component hiển thị sao
const StarRating: React.FC<{ rating?: number }> = ({ rating }) => {
  if (!rating || rating <= 0) return null;
  
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="star-rating">
      <div className="star-container">
        {/* Full stars */}
        <span className="star-full">{'★'.repeat(fullStars)}</span>
        
        {/* Half star */}
        {halfStar && (
          <span className="star-half">
            <span className="star-background">★</span>
            <span className="star-overlay">★</span>
          </span>
        )}
        
        {/* Empty stars */}
        <span className="star-empty">{'★'.repeat(emptyStars)}</span>
      </div>
      <span className="rating-number">{rating.toFixed(1)}</span>
    </div>
  );
};

// Component Range Slider tùy chỉnh
const PriceRangeSlider: React.FC<{
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}> = ({ minValue, maxValue, min, max, onChange }) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [formattedMinValue, setFormattedMinValue] = useState<string>(minValue.toString());
  const [formattedMaxValue, setFormattedMaxValue] = useState<string>(maxValue.toString());

  // Hàm định dạng số với dấu chấm ngăn cách phần nghìn
  const formatNumberWithDots = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Cập nhật giá trị định dạng khi minValue hoặc maxValue thay đổi
  useEffect(() => {
    setFormattedMinValue(formatNumberWithDots(minValue));
    setFormattedMaxValue(formatNumberWithDots(maxValue));
  }, [minValue, maxValue]);

  // Xử lý giá trị nhập vào từ ô input
  const parseInputValue = (value: string, defaultValue: number): number => {
    // Loại bỏ dấu chấm và các ký tự không phải số
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) {
      alert('Vui lòng nhập số hợp lệ');
      return defaultValue; // Trả về giá trị mặc định (minValue hoặc maxValue)
    }
    return parseInt(cleanValue, 10);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}tr `;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k `;
    }
    return formatNumberWithDots(amount);
  };

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = (percentage: number) => {
    return Math.round(min + (percentage / 100) * (max - min));
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const slider = document.querySelector('.price-slider-track') as HTMLElement;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    requestAnimationFrame(() => {
      if (isDragging === 'min') {
        const newMin = Math.min(newValue, maxValue - 1000);
        onChange(newMin, maxValue);
      } else if (isDragging === 'max') {
        const newMax = Math.max(newValue, minValue + 1000);
        onChange(minValue, newMax);
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, minValue, maxValue]);

  return (
    <div className="price-range-slider">
      <div className="price-inputs">
        <div className="price-input-group">
          <input
            type="text"
            value={formattedMinValue}
            onChange={(e) => {
              const rawValue = e.target.value;
              setFormattedMinValue(rawValue);
              const value = parseInputValue(rawValue, minValue);
              const newMin = Math.max(min, Math.min(value, maxValue - 1000));
              onChange(newMin, maxValue);
            }}
            onBlur={() => setFormattedMinValue(formatNumberWithDots(minValue))}
            className="price-input"
          />
          <span className="price-unit">đ</span>
        </div>
        <div className="price-input-group">
          <input
            type="text"
            value={formattedMaxValue}
            onChange={(e) => {
              const rawValue = e.target.value;
              setFormattedMaxValue(rawValue);
              const value = parseInputValue(rawValue, maxValue);
              const newMax = Math.min(max, Math.max(value, minValue + 1000));
              onChange(minValue, newMax);
            }}
            onBlur={() => setFormattedMaxValue(formatNumberWithDots(maxValue))}
            className="price-input"
          />
          <span className="price-unit">đ</span>
        </div>
      </div>

      <div className="price-slider-container">
        <div className="price-slider-track">
          <div
            className="price-slider-range"
            style={{
              left: `${getPercentage(minValue)}%`,
              width: `${getPercentage(maxValue) - getPercentage(minValue)}%`
            }}
          />
          <div
            className="price-slider-thumb price-slider-thumb-min"
            style={{ left: `${getPercentage(minValue)}%` }}
            onMouseDown={handleMouseDown('min')}
          />
          <div
            className="price-slider-thumb price-slider-thumb-max"
            style={{ left: `${getPercentage(maxValue)}%` }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
        <div className="price-slider-labels">
          <span>{formatCurrency(min)}đ</span>
          <span>{formatCurrency(max)}đ</span>
        </div>
      </div>
    </div>
  );
};

const ProductListPage: React.FC = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  
  // Thay đổi từ selectedPrice thành minPrice và maxPrice
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const PRICE_MIN = 0;
  const PRICE_MAX = 1000000;
  
  const [sortOrder, setSortOrder] = useState<string | null>("newest");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const itemsPerPage = 12;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const { addToCart } = useCart();
  const { addToFavorite, removeFromFavorite, favorites } = useFavorite();
  const { user } = useAuth();

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Load danh mục và thương hiệu
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandData, hierarchyData] = await Promise.all([
          fetchAllBrands(),
          fetchCategoriesHierarchy(),
        ]);
        setBrands(brandData);
        setCategories(hierarchyData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    loadData();
  }, []);

  // Load filters từ URL hoặc sessionStorage
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const brandFromUrl = searchParams.get("brand");

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    if (brandFromUrl) {
      setSelectedBrand(brandFromUrl);
    }

    // Nếu không có gì trong URL thì fallback từ sessionStorage
    if (!categoryFromUrl && !brandFromUrl) {
      const saved = sessionStorage.getItem("productFilters");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedCategory(parsed.category || "all");
        setSelectedBrand(parsed.brand || "all");
        setMinPrice(parsed.minPrice || PRICE_MIN);
        setMaxPrice(parsed.maxPrice || PRICE_MAX);
        setSortOrder(parsed.sortOrder || "newest");
        setTimeout(() => window.scrollTo(0, parsed.scroll || 0), 50);
      }
    }

    setFiltersInitialized(true);
  }, [searchParams]);

  // Hàm sắp xếp sản phẩm
  const sortProducts = (productList: Product[], order: string | null) => {
    let sortedProducts = [...productList];
    
    switch (order) {
      case "newest":
        sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return (b._id || "").localeCompare(a._id || "");
        });
        break;
      case "oldest":
        sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return (a._id || "").localeCompare(b._id || "");
        });
        break;
      case "high-to-low":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "low-to-high":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "rating":
        sortedProducts.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      default:
        sortedProducts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return (b._id || "").localeCompare(a._id || "");
        });
    }
    
    return sortedProducts;
  };

  // Lọc và sắp xếp sản phẩm theo bộ lọc
  useEffect(() => {
    if (!filtersInitialized) return;

    const fetchProducts = async () => {
      try {
        const filters: { category_id?: string; brand_id?: string; minPrice?: number; maxPrice?: number } = {};

        if (selectedCategory !== "all") filters.category_id = selectedCategory;
        if (selectedBrand !== "all") filters.brand_id = selectedBrand;
        
        // Sử dụng minPrice và maxPrice thay vì selectedPrice
        if (minPrice > PRICE_MIN || maxPrice < PRICE_MAX) {
          filters.minPrice = minPrice;
          filters.maxPrice = maxPrice;
        }

        const productData = await fetchFilteredProducts(filters);
        const sortedProducts = sortProducts(productData, sortOrder);
        
        setProducts(sortedProducts);
        setCurrentPage(1);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, sortOrder, filtersInitialized]);

  // Lưu filters vào sessionStorage khi thay đổi
  useEffect(() => {
    if (filtersInitialized) {
      sessionStorage.setItem(
        "productFilters",
        JSON.stringify({
          category: selectedCategory,
          brand: selectedBrand,
          minPrice: minPrice,
          maxPrice: maxPrice,
          sortOrder: sortOrder,
          scroll: 0,
        })
      );
    }
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, sortOrder, filtersInitialized]);

  const handleFavoriteClick = async (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token");
      navigate("/login");
      return;
    }

    const isFavorite = favorites.some((f) => f._id === product._id);

    try {
      if (isFavorite) {
        await axios.post(
          "/api/favorite/remove",
          { product_id: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        removeFromFavorite(product._id);
      } else {
        await axios.post(
          "/api/favorite/add",
          { product_id: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addToFavorite({
          _id: product._id,
          name: product.name,
          price: product.price,
          img_url: product.img_url,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật yêu thích:", error.response?.data || error.message);
    }
  };

  const getImageUrl = (url?: string): string => {
    if (!url) return '/images/no-image.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/products/${url}`;
  };

  const getBrandImageUrl = (brand: Brand): string => {
    if (brand.logo_url) {
      if (brand.logo_url.startsWith('http')) return brand.logo_url;
      if (brand.logo_url.startsWith('/uploads')) return `http://localhost:5000${brand.logo_url}`;
      return `http://localhost:5000/uploads/brands/${brand.logo_url}`;
    }
    if (brand.logo_data) {
      return brand.logo_data;
    }
    return "/public/assets/default_brand_logo.png";
  };

  const sortMenu = (
    <Menu onClick={(e) => setSortOrder(e.key as string)}>
      <Menu.Item key="newest">Mới nhất</Menu.Item>
      <Menu.Item key="oldest">Cũ nhất</Menu.Item>
      <Menu.Item key="high-to-low">Giá cao đến thấp</Menu.Item>
      <Menu.Item key="low-to-high">Giá thấp đến cao</Menu.Item>
      <Menu.Item key="rating">Đánh giá cao nhất</Menu.Item>
    </Menu>
  );

  const getSortLabel = (sortOrder: string | null) => {
    switch (sortOrder) {
      case "newest": return "Mới nhất";
      case "oldest": return "Cũ nhất";
      case "high-to-low": return "Giá cao đến thấp";
      case "low-to-high": return "Giá thấp đến cao";
      case "rating": return "Đánh giá cao nhất";
      default: return "Mới nhất";
    }
  };

  const toggleDropdown = (categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="product-page-container">
      <div className="product-layout">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={6} lg={5} className="sidebar">
            <div className="sidebar-section">
              <div className="dropdown-header">
                <span>DANH MỤC SẢN PHẨM</span>
              </div>
              <div className="dropdown-content-wrapper">
                <ul className="dropdown-content">
                  <li
                    onClick={() => {
                      setSelectedCategory("all");
                      setOpenDropdown(null);
                    }}
                    className={selectedCategory === "all" ? "active" : ""}
                  >
                    TẤT CẢ SẢN PHẨM
                  </li>
                  {categories.map((category) => (
                    <li key={category._id} className={selectedCategory === category._id ? "active" : ""}>
                      <div
                        className="category-item"
                        onClick={() => {
                          setSelectedCategory(category._id || "all");
                          toggleDropdown(category._id || "");
                        }}
                      >
                        {category.name}
                        {category.children && category.children.length > 0 && (
                          <span className="dropdown-icon">
                            {openDropdown === category._id ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                      {category.children && category.children.length > 0 && openDropdown === category._id && (
                        <ul className="child-category-list">
                          {category.children.map((child) => (
                            <li
                              key={child._id}
                              onClick={() => setSelectedCategory(child._id || "all")}
                              className={selectedCategory === child._id ? "active" : ""}
                            >
                              {child.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Thay thế price-filter bằng price-range-slider */}
              <div className="price-filter">
                <h3>KHOẢNG GIÁ</h3>
                <PriceRangeSlider
                  minValue={minPrice}
                  maxValue={maxPrice}
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  onChange={handlePriceRangeChange}
                />
              </div>
            </div>

            <div className="sidebar-banner">
              <img src="/public/assets/about_vertical_sale_banner.png" alt="Giảm giá sốc" />
              <img src="/public/assets/about_vertical_sale2_banner.png" alt="Giảm giá sốc" />
            </div>
          </Col>

          <Col xs={24} sm={24} md={18} lg={19} className="product-content">
            <div className="brand-bar">
              <h3>THƯƠNG HIỆU</h3>
              <div className="brand-radio-group">
                <div
                  className={`brand-item ${selectedBrand === "all" ? "selected" : ""}`}
                  onClick={() => setSelectedBrand("all")}
                >
                  <span>Tất cả</span>
                </div>
                <div className="brand-scroll-container">
                  {brands.map((b) => (
                    <div
                      className={`brand-item ${selectedBrand === b._id ? "selected" : ""}`}
                      key={b._id}
                      onClick={() => setSelectedBrand(b._id)}
                    >
                      <img
                        src={getBrandImageUrl(b)}
                        alt={b.name}
                        className="brand-logo"
                        title={b.name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-header">
              <h2>
                {selectedCategory === "all"
                  ? "Sản phẩm"
                  : categories
                      .flatMap((c) => [c, ...(c.children || [])])
                      .find((c) => c._id === selectedCategory)?.name || "Sản phẩm"}
              </h2>
              <Dropdown overlay={sortMenu} trigger={['click']}>
                <a className="sort-button" onClick={(e) => e.preventDefault()}>
                  {getSortLabel(sortOrder)} <DownOutlined />
                </a>
              </Dropdown>
            </div>

            <Row gutter={[16, 16]} className="product-grid">
              {products.length > 0 ? (
                paginatedProducts.map((product) => {
                  const isFavorite = favorites.some((f) => f._id === product._id);
                  return (
                    <Col xs={12} sm={8} md={6} lg={6} key={product._id}>
                      <div className="product-card">
                        <img
                          src={getImageUrl(product.img_url)}
                          alt={product.name}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            sessionStorage.setItem(
                              "productFilters",
                              JSON.stringify({
                                category: selectedCategory,
                                brand: selectedBrand,
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                sortOrder: sortOrder,
                                scroll: window.scrollY,
                              })
                            );
                            navigate(`/product/${product._id}`);
                          }}
                        />

                        <p className="product-brand">
                          {typeof product.brand_id === "object" ? product.brand_id.name : product.brand_id}
                        </p>
                        <h4 className="product-name">{product.name}</h4>
                        {product.average_rating > 0 && <StarRating rating={product.average_rating} />}

                        <div className="price-block">
                          <div className="price-left">
                            {product.sale > 0 && product.price > 0 ? (
                              <>
                                <div className="discount-price">{formatCurrency(product.price - product.sale)}</div>
                                <div className="original-price">{formatCurrency(product.price)}</div>
                              </>
                            ) : (
                              <div className="discount-price">{formatCurrency(product.price)}</div>
                            )}
                          </div>
                          {product.sale > 0 && product.price > 0 && (
                            <div className="discount-percent">
                              -{Math.round((product.sale / product.price) * 100)}%
                            </div>
                          )}
                        </div>
                        <button
                          className="add-to-cart-btnn"
                          onClick={() =>
                            addToCart({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              sale: product.sale && product.sale > 0 ? product.sale : 0,
                              img_url: product.img_url,
                              quantity: 1,
                            })
                          }
                        >
                          <FaShoppingCart className="cart-icon" />
                          <span className="btn-text">Thêm vào giỏ</span>
                        </button>
                        <button
                          className="favorite-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(product);
                          }}
                        >
                          {favorites.some((f) => f._id === product._id) ? <FaHeart /> : <FaRegHeart />}
                        </button>
                      </div>
                    </Col>
                  );
                })
              ) : (
                <p>Không có sản phẩm phù hợp.</p>
              )}
            </Row>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  &laquo; Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={currentPage === i + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau &raquo;
                </button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductListPage;