import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import { FaShoppingCart, FaRegHeart, FaHeart } from "react-icons/fa";
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
  const [topViewedProducts, setTopViewedProducts] = useState<Product[]>([]);
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
  const [countdown, setCountdown] = useState<{hours:string; minutes:string; seconds:string}>({hours:"00", minutes:"00", seconds:"00"});
  const saleListRef = React.useRef<HTMLDivElement | null>(null);
  const FS_PAGE_SIZE = 5;
  const [fsStart, setFsStart] = useState<number>(0);

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

  const getSaleValue = (sale: number | string | null | undefined): number => {
    const parsed = typeof sale === 'string' ? Number(sale) : typeof sale === 'number' ? sale : 0;
    return Number.isFinite(parsed) ? parsed : 0;
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
        setTopViewedProducts(homeData.bestSellerProducts || []);
        // bestSellerProducts used for Top Viewed section

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

  // Top viewed carousel index
  const [currentViewedIndex, setCurrentViewedIndex] = useState(0);
  const nextViewed = () => {
    const nextIndex = currentViewedIndex + 5;
    if (nextIndex < topViewedProducts.length) setCurrentViewedIndex(nextIndex);
  };
  const prevViewed = () => {
    const prevIndex = currentViewedIndex - 5;
    if (prevIndex >= 0) setCurrentViewedIndex(prevIndex);
  };

  // Sale carousel navigation not used in UI currently
  const scrollSaleLeft = () => {
    setFsStart((prev) => Math.max(0, prev - FS_PAGE_SIZE));
    if (saleListRef.current) {
      saleListRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };
  const scrollSaleRight = () => {
    const remainder = saleProducts.length % FS_PAGE_SIZE;
    const lastStartIndex = Math.max(0, saleProducts.length - (remainder === 0 ? FS_PAGE_SIZE : remainder));
    setFsStart((prev) => Math.min(lastStartIndex, prev + FS_PAGE_SIZE));
    if (saleListRef.current) {
      setTimeout(() => saleListRef.current && saleListRef.current.scrollTo({ left: 0, behavior: 'smooth' }), 0);
    }
  };

  const remainder = saleProducts.length % FS_PAGE_SIZE;
  const lastStartIndex = Math.max(0, saleProducts.length - (remainder === 0 ? FS_PAGE_SIZE : remainder));
  const canScrollLeft = fsStart > 0;
  const canScrollRight = fsStart < lastStartIndex;

  // Countdown to 10:00 every day
  useEffect(() => {
    const getNextTenAM = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(10, 0, 0, 0);
      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }
      return target;
    };

    let targetTime = getNextTenAM().getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      });
      if (diff === 0) {
        targetTime = getNextTenAM().getTime();
      }
    };
    const intervalId = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(intervalId);
  }, []);

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

  const navigateToRandomProduct = () => {
    const pool = [...hotProducts, ...saleProducts];
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (random?._id) navigate(`/product/${random._id}`);
  };

  return (
    <div className="home-page">
      <section id="banner">
        <div className="home-page-container">
          
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
                      <div key={index} className="slide" onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
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
                <div className="promo-banner" onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
                  <img src="/img/sl1.webp" alt="Banner khuyến mãi 1" />
                </div>
                <div className="promo-banner" onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
                  <img src="/img/sl2.png" alt="Banner khuyến mãi 2" />
                </div>
                <div className="promo-banner" onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
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


<section className="flash-sale">
  <div className="fs-header">
    <div className="timer">
      <div className="box">{countdown.hours}</div>
      <span>:</span>
      <div className="box">{countdown.minutes}</div>
      <span>:</span>
      <div className="box">{countdown.seconds}</div>
    </div>
    <div className="fs-title">⚡ FLASH SALE 10H MỖI NGÀY</div>
    <div className="fs-date-pill">{new Date().getDate()}/{new Date().getMonth()+1}</div>
  </div>
  <div className="fs-tab">Flash sale</div>
  <div className="fs-track-wrapper">
    <button className="fs-arrow left" onClick={scrollSaleLeft} disabled={!canScrollLeft}>‹</button>
    <div className="fs-track" ref={saleListRef}>
      {saleProducts.length > 0 ? (
        saleProducts.slice(fsStart, fsStart + FS_PAGE_SIZE).map((product) => (
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
            <StarRating rating={product.averageRating || 0} />
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
    <button className="fs-arrow right" onClick={scrollSaleRight} disabled={!canScrollRight}>›</button>
  </div>
</section>

<section className="flash-sale hot-products as-flash">
  <div className="fs-header">
    <div className="fs-title">🔥 SẢN PHẨM HOT</div>
  </div>
  <div className="fs-track-wrapper">
    <button className="fs-arrow left" onClick={prevHot} disabled={currentHotIndex === 0}>‹</button>
    <div className="fs-track" ref={null}>
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
            {product.averageRating && product.averageRating > 0 && <StarRating rating={product.averageRating} />}
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
        <p>Không có sản phẩm nào trong danh mục này.</p>
      )}
    </div>
    <button className="fs-arrow right" onClick={nextHot} disabled={currentHotIndex + 5 >= hotProducts.length}>›</button>
  </div>
</section>

<section className="separator-banner" onClick={() => navigate(`/product/${hotProducts[0]?._id || ''}`)} style={{ cursor: hotProducts.length ? 'pointer' : 'default' }}>
  <img src="/public/img/test.png" alt="Separator" />
</section>


      {categories.slice(0, 4).map((category) => (
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
                        {product.averageRating && product.averageRating > 0 && <StarRating rating={product.averageRating} />}
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

      <section className="deals-section">
        <div className="wrapper">
          <h2>ƯU ĐÃI SẢN PHẨM</h2>
          <div className="deal-grid">
            {["/img/bn1.png","/img/sl1.webp","/img/sl2.png","/img/r2.jpg"].map((src, idx) => (
              <div className="deal-card" key={`prod-deal-${idx}`} onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
                <img src={src} alt={`Ưu đãi sản phẩm ${idx+1}`} />
              </div>
            ))}
          </div>

          <h2>ƯU ĐÃI THƯƠNG HIỆU</h2>
          <div className="deal-grid">
            {["/img/r3.webp","/img/r4.jpg","/img/r5.png","/img/bn1.png"].map((src, idx) => (
              <div className="deal-card" key={`brand-deal-${idx}`} onClick={navigateToRandomProduct} style={{ cursor: 'pointer' }}>
                <img src={src} alt={`Ưu đãi thương hiệu ${idx+1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;