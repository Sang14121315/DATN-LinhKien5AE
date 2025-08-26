import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import { FaShoppingCart, FaRegHeart, FaHeart, FaBars } from "react-icons/fa";
import axios from "axios";

import { Product, fetchFilteredProducts } from "@/api/user/productAPI";
import { fetchHomeData } from '../../api/user/homeAPI';
import { Category, fetchCategoriesHierarchy } from '../../api/user/categoryAPI';
import { Brand, fetchAllBrands } from "@/api/user/brandAPI";
import "@/styles/pages/user/home.scss";

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  // Removed bestSellerProducts unused state to simplify hot products section
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentHotIndex, setCurrentHotIndex] = useState(0);
  // Removed unused sale index state
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand] = useState("all");

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, addToFavorite, removeFromFavorite } = useFavorite();
  const { user } = useAuth();

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const getImageUrl = (url?: string): string => {
    if (!url) return '/images/no-image.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/products/${url}`;
  };

  const handleFavoriteClick = async (product: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("Lỗi khi cập nhật yêu thích:", err.response?.data || err.message);
    }
  };

  const bannerImages = [
    "/img/bn1.png",
    "/img/r3.webp",
    "/img/r4.jpg",
    "/img/r5.png"
  ];

  const getSaleValue = (sale: any) => {
    const n = Number(sale);
    return isNaN(n) ? 0 : n;
  };

  // Thêm component hiển thị sao
  const StarRating: React.FC<{ rating?: number }> = ({ rating }) => {
    if (!rating || rating <= 0) return null;
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div style={{ color: '#FFD700', fontSize: '1.5em', margin: '8px 0 4px 0', display: 'flex', alignItems: 'center' }}>
        <span>{'★'.repeat(fullStars)}{halfStar ? '½' : ''}{'☆'.repeat(emptyStars)}</span>
        <span style={{ color: '#333', marginLeft: 8, fontSize: '0.9em' }}>{rating.toFixed(1)}</span>
      </div>
    );
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeData, hierarchyData] = await Promise.all([
          fetchHomeData(),
          fetchCategoriesHierarchy(),
        ]);
        setCategories(hierarchyData); // Sử dụng hierarchyData để có children
        setHotProducts(homeData.hotProducts);
        setSaleProducts(homeData.saleProducts);
        // bestSellerProducts not used on this page currently

        const allCategoryProducts: Record<string, Product[]> = {};
        const validCategories = hierarchyData.filter((c) => Boolean(c._id));
        const productPromises = validCategories.map((category) =>
          fetchFilteredProducts({ category_id: category._id as string }).then((res) => ({
            categoryId: category._id as string,
            products: res,
          }))
        );
        const results = await Promise.all(productPromises);
        results.forEach(({ categoryId, products }) => {
          allCategoryProducts[categoryId as string] = products;
        });
        setProductsByCategory(allCategoryProducts);

        // Khởi tạo hot-products hiển thị từ hotProducts
        setCurrentHotIndex(0);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      }
    };

    fetchData();
  }, []);

useEffect(() => {
  const fetchBrands = async () => {
    try {
      const brandData = await fetchAllBrands();
      setBrands(brandData);
    } catch (error) {
      console.error("Lỗi khi tải thương hiệu:", error as unknown);
    }
  };
  fetchBrands();
}, []);

// Removed category-based state syncing for hot products


  useEffect(() => {
    setCurrentHotIndex(0);
  }, [hotProducts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

    const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextHot = () => {
    const nextIndex = currentHotIndex + 5;
    if (nextIndex < hotProducts.length) setCurrentHotIndex(nextIndex);
  };

  const prevHot = () => {
    const prevIndex = currentHotIndex - 5;
    if (prevIndex >= 0) setCurrentHotIndex(prevIndex);
  };

  // Sale carousel navigation not used in UI currently

  const toggleDropdown = (categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

const getBrandImageUrl = (brand: Brand): string => {
  if (brand.logo_url) {
    if (brand.logo_url.startsWith("http")) return brand.logo_url;
    if (brand.logo_url.startsWith("/uploads")) return `http://localhost:5000${brand.logo_url}`;
    return `http://localhost:5000/uploads/brands/${brand.logo_url}`;
  }
  // Removed usage of logo_data to satisfy Brand type
  return "/public/assets/default_brand_logo.png";
};

  // renderProductItem no longer used

  return (
    <div className="home-page">
      <section id="banner">
        <div className="home-page-container">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-section">
              <div className="dropdown-header">DANH MỤC SẢN PHẨM</div>
              <div className="dropdown-content-wrapper">
                <ul className="dropdown-content">
                  <li
                    onClick={() => {
                      setSelectedCategory("all");
                      setOpenDropdown(null);
                      setIsSidebarOpen(false);
                      navigate("/product-list");
                    }}
                    className={selectedCategory === "all" ? "active" : ""}
                  >
                    TẤT CẢ SẢN PHẨM
                  </li>
                  {categories.map((category) => (
                    <li key={category._id} className={selectedCategory === category._id ? "active" : ""}>
                      <div
                        className="category-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (category.children && category.children.length > 0) {
                            toggleDropdown(category._id || "");
                          } else {
                            setSelectedCategory(category._id || "all");
                            setOpenDropdown(null);
                            setIsSidebarOpen(false);
                            navigate(`/product-list?category=${category._id}`);
                          }
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
                              onClick={() => {
                                setSelectedCategory(child._id || "all");
                                setOpenDropdown(null);
                                setIsSidebarOpen(false);
                                navigate(`/product-list?category=${child._id}`);
                              }}
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
            </div>
          </aside>

          <div className="content-right">
            <div className="hero-banner">
              <div className="main-banner">
                <div className="slider-container">
                  <div
                    className="slider-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {bannerImages.map((image, index) => (
                      <div key={index} className="slide">
                        <img src={image} alt={`Banner ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                  <button className="slider-arrow prev" onClick={prevSlide}>
                    ‹
                  </button>
                  <button className="slider-arrow next" onClick={nextSlide}>
                    ›
                  </button>
                  <div className="slider-dots">
                    {bannerImages.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="promo-banners">
                <div className="promo-banner">
                  <img src="/img/sl1.webp" alt="Banner khuyến mãi 1" />
                </div>
                <div className="promo-banner">
                  <img src="/img/sl2.png" alt="Banner khuyến mãi 2" />
                </div>
                <div className="promo-banner">
                  <img src="/img/r2.jpg" alt="Banner khuyến mãi 3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="brand-section">
  <div className="brand-radio-group">

    <div className="brand-scroll-container">
      {brands.slice(0, 10).map((b) => (   // chỉ lấy 8 brand đầu tiên
        <div
          className={`brand-item ${selectedBrand === b._id ? "selected" : ""}`}
          key={b._id}
          onClick={() => navigate(`/product-list?brand=${b._id}`)}
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
</section>

<section className="hot-products">
  <div className="hot-sale-header">
    <div className="header-left">
      <div className="title-section">
        <span className="flame-icon">🔥</span>
        <h2>SẢN PHẨM HOT</h2>
      </div>
    </div>
  </div>

  <div className="product-carousel">
    <button
      className="carousel-arrow prev"
      onClick={prevHot}
      disabled={currentHotIndex === 0}
    >
      ‹
    </button>
    <div className="product-list">
      {hotProducts.length > 0 ? (
        hotProducts.slice(currentHotIndex, currentHotIndex + 5).map((product) => (
          <div className="product-card" key={product._id}>
            <img
              src={getImageUrl(product.img_url)}
              alt={product.name}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/${product._id}`)}
            />
            <p className="product-brand">
              {typeof product.brand_id === "object"
                ? product.brand_id.name
                : product.brand_id}
            </p>
            <h4 className="product-name">{product.name}</h4>
            {product.average_rating > 0 && <StarRating rating={product.average_rating} />}
            <div className="price-block">
              <div className="price-left">
                {getSaleValue(product.sale) > 0 && product.price > 0 ? (
                  <>
                    <div className="discount-price">{formatCurrency(product.price - getSaleValue(product.sale))}</div>
                    <div className="original-price">{formatCurrency(product.price)}</div>
                    <div className="discount-percent">-{Math.round((getSaleValue(product.sale) / product.price) * 100)}%</div>
                  </>
                ) : (
                  <div className="discount-price">{formatCurrency(product.price)}</div>
                )}
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
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
                className="favorite-iconm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteClick(product);
                }}
              >
                {favorites.some((f) => f._id === product._id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có sản phẩm nào trong danh mục này.</p>
      )}
    </div>
    <button
      className="carousel-arrow next"
      onClick={nextHot}
      disabled={currentHotIndex + 5 >= hotProducts.length}
    >
      ›
    </button>
  </div>
</section>

<section className="km-products">
  <div className="section-header">
    <h2>SẢN PHẨM KHUYẾN MÃI</h2>
  </div>
  <div className="product-carousel">
    <div className="product-list">
      {saleProducts.length > 0 ? (
        saleProducts.slice(0, 5).map((product) => (
          <div className="product-card" key={product._id}>
            <img
              src={getImageUrl(product.img_url)}
              alt={product.name}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/product/${product._id}`)}
            />
            <p className="product-brand">
              {typeof product.brand_id === "object"
                ? product.brand_id.name
                : product.brand_id}
            </p>
            <h4 className="product-name">{product.name}</h4>
            <StarRating rating={product.average_rating || 0} />
            <div className="price-block">
              <div className="price-left">
                {getSaleValue(product.sale) > 0 && product.price > 0 ? (
                  <>
                    <div className="discount-price">{formatCurrency(product.price - getSaleValue(product.sale))}</div>
                    <div className="original-price">{formatCurrency(product.price)}</div>
                  </>
                ) : (
                  <div className="discount-price">{formatCurrency(product.price)}</div>
                )}
              </div>
              {getSaleValue(product.sale) > 0 && product.price > 0 && (
                <div className="discount-percent">
                  -{Math.round((getSaleValue(product.sale) / product.price) * 100)}%
                </div>
              )}
            </div>
            <div className="action-buttons">
              <button
                className="add-to-cart-btn"
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
                className="favorite-iconm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteClick(product);
                }}
              >
                {favorites.some((f) => f._id === product._id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Không có sản phẩm khuyến mãi.</p>
      )}
    </div>
  </div>
</section>

      {categories.map((category) => (
        <section key={category._id} id="qc-gh">
          <div className="wrapper">
            <h2>{category.name}</h2>
            <div className="workstation-section">
              <div className="right-products">
                <div className="product-grid">
                  {(productsByCategory[category._id as string] || []).length > 0 ? (
                    (productsByCategory[category._id as string] || []).slice(0, 5).map((product: Product) => (
                      <div className="product-card" key={product._id}>
                        <img
                          src={getImageUrl(product.img_url)}
                          alt={product.name}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            sessionStorage.setItem(
                              "productFilters",
                              JSON.stringify({
                                category: category._id,
                                brand: null,
                                price: null,
                                scroll: window.scrollY,
                              })
                            );
                            navigate(`/product/${product._id}`);
                          }}
                        />
                        <p className="product-brand">
                          {typeof product.brand_id === "object"
                            ? product.brand_id.name
                            : product.brand_id}
                        </p>
                        <h4 className="product-name">{product.name}</h4>
                        {product.average_rating > 0 && <StarRating rating={product.average_rating} />}
                        <div className="price-block">
                          <div className="price-left">
                            {getSaleValue(product.sale) > 0 && product.price > 0 ? (
                              <>
                                <div className="discount-price">{formatCurrency(product.price - getSaleValue(product.sale))}</div>
                                <div className="original-price">{formatCurrency(product.price)}</div>
                              </>
                            ) : (
                              <div className="discount-price">{formatCurrency(product.price)}</div>
                            )}
                          </div>
                          {getSaleValue(product.sale) > 0 && product.price > 0 && (
                            <div className="discount-percent">
                              -{Math.round((getSaleValue(product.sale) / product.price) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="action-buttons">
                          <button
                            className="add-to-cart-btn"
                            onClick={() =>
                              addToCart({
                                _id: product._id,
                                name: product.name,
                                price: product.price,
                                img_url: product.img_url,
                                quantity: 1,
                              })
                            }
                          >
                            <FaShoppingCart className="cart-icon" />
                            <span className="btn-text">Thêm vào giỏ</span>
                          </button>
                          <button
                            className="favorite-iconm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteClick(product);
                            }}
                          >
                            {favorites.some((f) => f._id === product._id) ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Không có sản phẩm trong danh mục này.</p>
                  )}
                </div>
                <div className="load-more">
                  <button onClick={() => navigate(`/product-list?category=${category._id}`)}>
                    Xem thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default HomePage;