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
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [allCategoryProducts, setAllCategoryProducts] = useState<Product[]>([]);
  const [currentSaleIndex, setCurrentSaleIndex] = useState(0);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("all");

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
    } catch (error: any) {
      console.error("Lỗi khi cập nhật yêu thích:", error.response?.data || error.message);
    }
  };

  const bannerImages = [
    "/img/bn1.png",
    "/img/r3.webp",
    "/img/r4.jpg",
    "/img/r5.png"
  ];


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
        setBestSellerProducts(homeData.bestSellerProducts);

        const allCategoryProducts: Record<string, Product[]> = {};
        const productPromises = hierarchyData.map((category) =>
          fetchFilteredProducts({ category_id: category._id, limit: 5 }).then((res) => ({
            categoryId: category._id,
            products: res,
          }))
        );
        const results = await Promise.all(productPromises);
        results.forEach(({ categoryId, products }) => {
          allCategoryProducts[categoryId] = products;
        });
        setProductsByCategory(allCategoryProducts);
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
      console.error("Lỗi khi tải thương hiệu:", error);
    }
  };
  fetchBrands();
}, []);

useEffect(() => {
  const fetchProductsByCategory = async () => {
    try {
      let filteredProducts: Product[];
      if (selectedCategory === 'all') {
        filteredProducts = hotProducts;
      } else {
        filteredProducts = await fetchFilteredProducts({ category_id: selectedCategory });
      }
      setAllCategoryProducts(filteredProducts);
      setCategoryProducts(filteredProducts.slice(0, 5));
      setCurrentProductIndex(0);
    } catch (error) {
      console.error('Lỗi khi lọc sản phẩm theo danh mục:', error);
      setAllCategoryProducts(hotProducts);
      setCategoryProducts(hotProducts.slice(0, 5));
      setCurrentProductIndex(0);
    }
  };

  fetchProductsByCategory();
}, [selectedCategory, hotProducts]);


  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        let filteredProducts: Product[];
        if (selectedCategory === 'all') {
          filteredProducts = hotProducts;
        } else {
          filteredProducts = await fetchFilteredProducts({ category_id: selectedCategory });
        }
        setAllCategoryProducts(filteredProducts);
        setCategoryProducts(filteredProducts.slice(0, 5));
        setCurrentProductIndex(0);
      } catch (error) {
        console.error('Lỗi khi lọc sản phẩm theo danh mục:', error);
        setAllCategoryProducts(hotProducts);
        setCategoryProducts(hotProducts.slice(0, 5));
        setCurrentProductIndex(0);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategory, hotProducts]);

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

  const nextProducts = () => {
    const nextIndex = currentProductIndex + 5;
    if (nextIndex < allCategoryProducts.length) {
      setCurrentProductIndex(nextIndex);
      setCategoryProducts(allCategoryProducts.slice(nextIndex, nextIndex + 5));
    }
  };

  const prevProducts = () => {
    const prevIndex = currentProductIndex - 5;
    if (prevIndex >= 0) {
      setCurrentProductIndex(prevIndex);
      setCategoryProducts(allCategoryProducts.slice(prevIndex, prevIndex + 5));
    }
  };

  const nextSaleProducts = () => {
    const nextIndex = currentSaleIndex + 4;
    if (nextIndex < saleProducts.length) {
      setCurrentSaleIndex(nextIndex);
    }
  };

  const prevSaleProducts = () => {
    const prevIndex = currentSaleIndex - 4;
    if (prevIndex >= 0) {
      setCurrentSaleIndex(prevIndex);
    }
  };

  const toggleDropdown = (categoryId: string) => {
    setOpenDropdown(openDropdown === categoryId ? null : categoryId);
  };

const getBrandImageUrl = (brand: Brand): string => {
  if (brand.logo_url) {
    if (brand.logo_url.startsWith("http")) return brand.logo_url;
    if (brand.logo_url.startsWith("/uploads")) return `http://localhost:5000${brand.logo_url}`;
    return `http://localhost:5000/uploads/brands/${brand.logo_url}`;
  }
  if (brand.logo_data) {
    return brand.logo_data;
  }
  return "/public/assets/default_brand_logo.png";
};

  const renderProductItem = (product: Product) => (
    <div key={product._id} className="product-item">
      <img
        src={`${getImageUrl(product.img_url)}?v=${Date.now()}`}
        alt={product.name}
        onClick={() => navigate(`/product/${product._id}`)}
        style={{ cursor: 'pointer' }}
      />
      <div className="product-name">{product.name}</div>
      <div>
        <span className="price">{product.price ? formatCurrency(product.price) : 'Giá không khả dụng'}</span>
        {product.sale && <span className="discount">-20%</span>}
      </div>
      {product.sale && product.price && (
        <div className="old-price">{formatCurrency(product.price * 1.2)}</div>
      )}
      <button
        className="add-to-cart"
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
        Thêm vào giỏ
      </button>
    </div>
  );

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
        <h2>KHUYẾN MÃI CUỐI TUẦN</h2>
      </div>
    </div>
  </div>

  <div className="product-carousel">
    <button
      className="carousel-arrow prev"
      onClick={prevProducts}
      disabled={currentProductIndex === 0}
    >
      ‹
    </button>
    <div className="product-list">
      {categoryProducts.length > 0 ? (
        categoryProducts.map((product) => (
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
            <div className="price-block">
              <div className="price-left">
                {product.sale && product.sale > 0 && product.price > 0 ? (
                  <>
                    <div className="discount-price">
                      {formatCurrency(product.price - product.sale)}
                    </div>
                    <div className="original-price">
                      {formatCurrency(product.price)}
                    </div>
                  </>
                ) : (
                  <div className="discount-price">
                    {product.price ? formatCurrency(product.price) : "Giá không khả dụng"}
                  </div>
                )}
              </div>
              {product.sale && product.sale > 0 && product.price > 0 && (
                <div className="discount-percent">
                  -{Math.round((product.sale / product.price) * 100)}%
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
        <p>Không có sản phẩm nào trong danh mục này.</p>
      )}
    </div>
    <button
      className="carousel-arrow next"
      onClick={nextProducts}
      disabled={currentProductIndex + 5 >= allCategoryProducts.length}
    >
      ›
    </button>
  </div>
</section>

<section className="km-products">
  <div className="section-header">
    <h2>SẢN PHẨM ĐƯỢC XEM NHIỀU NHẤT</h2>
  </div>
  <div className="product-carousel">
    <div className="product-list">
      {saleProducts.length > 0 ? (
        saleProducts.slice(currentSaleIndex, currentSaleIndex + 5).map((product) => (
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
            <div className="price-block">
              <div className="price-left">
                {product.sale && product.sale > 0 && product.price > 0 ? (
                  <>
                    <div className="discount-price">
                      {formatCurrency(product.price - product.sale)}
                    </div>
                    <div className="original-price">
                      {formatCurrency(product.price)}
                    </div>
                  </>
                ) : (
                  <div className="discount-price">
                    {product.price ? formatCurrency(product.price) : "Giá không khả dụng"}
                  </div>
                )}
              </div>
              {product.sale && product.sale > 0 && product.price > 0 && (
                <div className="discount-percent">
                  -{Math.round((product.sale / product.price) * 100)}%
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
                  {(productsByCategory[category._id] || []).length > 0 ? (
                    (productsByCategory[category._id] || []).slice(0, 5).map((product) => (
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
                        <div className="price-block">
                          <div className="price-left">
                            {product.sale && product.sale > 0 && product.price > 0 ? (
                              <>
                                <div className="discount-price">
                                  {formatCurrency(product.price - product.sale)}
                                </div>
                                <div className="original-price">
                                  {formatCurrency(product.price)}
                                </div>
                              </>
                            ) : (
                              <div className="discount-price">
                                {product.price ? formatCurrency(product.price) : 'Giá không khả dụng'}
                              </div>
                            )}
                          </div>
                          {product.sale && product.sale > 0 && product.price > 0 && (
                            <div className="discount-percent">
                              -{Math.round((product.sale / product.price) * 100)}%
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