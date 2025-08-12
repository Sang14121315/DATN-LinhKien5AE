import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import { FaShoppingCart, FaRegHeart, FaHeart } from "react-icons/fa";
import axios from "axios";

import { Product, fetchFilteredProducts } from "@/api/user/productAPI";
import { fetchHomeData, HomeDataResponse } from '../../api/user/homeAPI';
import { Category, fetchCategoriesByProductType } from '../../api/user/categoryAPI';
import { ProductType, fetchAllProductTypes } from "@/api/user/productTypeAPI";
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
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [expandedProductType, setExpandedProductType] = useState<string | null>(null);
  const [productTypeCategories, setProductTypeCategories] = useState<Record<string, Category[]>>({});

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

  // Handle favorite click with authentication check
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

  // Banner images array
  const bannerImages = [
    "/img/bn1.png",
    "/img/bn2.png",
    "/img/bn3.png",
    "/img/bn4.jpeg"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: HomeDataResponse = await fetchHomeData();
        setCategories(data.categories);
        setHotProducts(data.hotProducts);
        setSaleProducts(data.saleProducts);
        setBestSellerProducts(data.bestSellerProducts);

        // Fetch all products grouped by category concurrently
        const allCategoryProducts: Record<string, Product[]> = {};
        const productPromises = data.categories.map((category) =>
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

        // Fetch product types and their categories
        const productTypeData = await fetchAllProductTypes();
        setProductTypes(productTypeData);

        const categoriesByProductType: Record<string, Category[]> = {};
        const categoryPromises = productTypeData.map((productType) =>
          fetchCategoriesByProductType(productType._id).then((categories) => ({
            productTypeId: productType._id,
            categories,
          }))
        );
        const categoryResults = await Promise.all(categoryPromises);
        categoryResults.forEach(({ productTypeId, categories }) => {
          categoriesByProductType[productTypeId] = categories;
        });
        setProductTypeCategories(categoriesByProductType);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch products by category
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
        console.error('Lỗi khi tải sản phẩm theo danh mục:', error);
        setAllCategoryProducts(hotProducts);
        setCategoryProducts(hotProducts.slice(0, 5));
        setCurrentProductIndex(0);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategory, hotProducts]);

  // Auto slide effect
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

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
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

  const toggleProductType = (productTypeId: string) => {
    setExpandedProductType(expandedProductType === productTypeId ? null : productTypeId);
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
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="dropdown-header">Danh mục sản phẩm</div>
              <ul className="dropdown-content">
                <li
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => setSelectedCategory('all')}
                >
                  Tất cả sản phẩm
                </li>
                {productTypes.map((productType) => (
                  <React.Fragment key={productType._id}>
                    <li
                      className={`product-type-item ${expandedProductType === productType._id ? 'expanded' : ''}`}
                      onClick={() => toggleProductType(productType._id)}
                    >
                      {productType.name}
                      <span className="toggle-icon">{expandedProductType === productType._id ? '▼' : '▶'}</span>
                    </li>
                    {expandedProductType === productType._id && (
                      <ul className="subcategory-list">
                        {productTypeCategories[productType._id]?.map((category) => (
                          <li
                            key={category._id}
                            className={selectedCategory === category._id ? 'active' : ''}
                            onClick={() => {
                              setSelectedCategory(category._id);
                              navigate(`/product-list?category=${category._id}`);
                            }}
                          >
                            {category.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </React.Fragment>
                ))}
              </ul>
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
                  <img src="/img/sl4.png" alt="Banner khuyến mãi 1" />
                </div>
                <div className="promo-banner">
                  <img src="/img/sl2.png" alt="Banner khuyến mãi 2" />
                </div>
                <div className="promo-banner">
                  <img src="/img/sl3.png" alt="Banner khuyến mãi 3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hot-products">
        <div className="hot-sale-header">
          <div className="header-left">
            <div className="title-section">
              <span className="flame-icon">🔥</span>
              <h2>HOT SALE CUỐI TUẦN</h2>
            </div>
          </div>
          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryFilter('all')}
            >
              Tất cả
            </button>
            {categories.slice(0, 3).map((category) => (
              <button
                key={category._id}
                className={`filter-btn ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category._id)}
              >
                {category.name}
              </button>
            ))}
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
                <div key={product._id} className="hot-product-card">
                  <div className="card-header">
                    <span className="discount-tag">Giảm 13%</span>
                    <span className="installment-tag">Trả góp 0%</span>
                  </div>
                  <div className="product-image">
                    <img
                      src={`${getImageUrl(product.img_url)}?v=${Date.now()}`}
                      alt={product.name}
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                    
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <div className="rating-section">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${star <= 4 ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-text">(4.0)</span>
                    </div>
                    <div className="price-section">
                      <span className="current-price">
                        {product.price ? formatCurrency(product.price) : 'Giá không khả dụng'}
                      </span>
                      {product.sale && product.price && (
                        <span className="original-price">{formatCurrency(product.price * 1.15)}</span>
                      )}
                    </div>
                    <div className="installment-info">
                      Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng
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
          <h2>Sản phẩm khuyến mãi</h2>
        </div>
        <div className="product-carousel">
          <div className="product-list">
            {saleProducts.length > 0 ? (
              saleProducts.slice(currentSaleIndex, currentSaleIndex + 5).map((product) => (
                <div key={product._id} className="hot-product-card">
                  <div className="card-header">
                    <span className="discount-tag">Giảm 20%</span>
                    <span className="installment-tag">Trả góp 0%</span>
                  </div>
                  <div className="product-image">
                    <img
                      src={`${getImageUrl(product.img_url)}?v=${Date.now()}`}
                      alt={product.name}
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
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
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <div className="rating-section">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`star ${star <= 4 ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                      <span className="rating-text">(4.0)</span>
                    </div>
                    <div className="price-section">
                      <span className="current-price">
                        {product.price ? formatCurrency(product.price) : 'Giá không khả dụng'}
                      </span>
                      {product.sale && product.price && (
                        <span className="original-price">{formatCurrency(product.price * 1.25)}</span>
                      )}
                    </div>
                    <div className="installment-info">
                      Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng 3-6 tháng
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
                        onMouseEnter={(e) => e.currentTarget.classList.add('expanded')}
                        onMouseLeave={(e) => e.currentTarget.classList.remove('expanded')}
                      >
                        <span className="btn-text">Thêm vào giỏ</span>
                      </button>
                    </div>
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
                        <button
                          className="favorite-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteClick(product);
                          }}
                        >
                          {favorites.some((f) => f._id === product._id) ? <FaHeart /> : <FaRegHeart />}
                        </button>
                        <p className="product-brand">
                          {typeof product.brand_id === "object"
                            ? product.brand_id.name
                            : product.brand_id}
                        </p>
                        <h4 className="product-name">{product.name}</h4>
                        <div className="price-block">
                          <div className="price-left">
                            {product.sale && product.price ? (
                              <>
                                <div className="discount-price">
                                  {formatCurrency(product.price * 0.66)}
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
                          {product.sale && <div className="discount-percent">-34%</div>}
                        </div>
                        <button
                          className="add-to-cart"
                          onClick={() =>
                            addToCart({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              img_url: getImageUrl(product.img_url),
                            })
                          }
                        >
                          <FaShoppingCart /> Thêm vào giỏ
                        </button>
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