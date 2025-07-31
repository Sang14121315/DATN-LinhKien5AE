import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Product, fetchAllProducts } from "@/api/user/productAPI";
import { fetchHomeData, HomeDataResponse } from '../../api/user/homeAPI';
import { Category } from '../../api/user/categoryAPI';
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

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Banner images array
  const bannerImages = [
    "/img/banner 1.webp",
    "/img/anh2.jpg", 
    "/img/slide_1_img.webp",
    "/img/slide_3_img.jpg"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: HomeDataResponse = await fetchHomeData();
        setCategories(data.categories);
        setHotProducts(data.hotProducts);
        setSaleProducts(data.saleProducts);
        setBestSellerProducts(data.bestSellerProducts);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch products by category
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (selectedCategory === 'all') {
        setAllCategoryProducts(hotProducts);
        setCategoryProducts(hotProducts.slice(0, 4));
        setCurrentProductIndex(0);
        return;
      }

      try {
        const allProducts = await fetchAllProducts();
        const filteredProducts = allProducts.filter(product => {
          if (typeof product.category_id === 'object' && product.category_id) {
            return (product.category_id as { _id: string })._id === selectedCategory;
          }
          return product.category_id === selectedCategory;
        });
        setAllCategoryProducts(filteredProducts);
        setCategoryProducts(filteredProducts.slice(0, 4));
        setCurrentProductIndex(0);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm theo danh mục:', error);
        setAllCategoryProducts(hotProducts);
        setCategoryProducts(hotProducts.slice(0, 4));
        setCurrentProductIndex(0);
      }
    };

    fetchProductsByCategory();
  }, [selectedCategory, hotProducts]);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change slide every 5 seconds

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
    const nextIndex = currentProductIndex + 4;
    if (nextIndex < allCategoryProducts.length) {
      setCurrentProductIndex(nextIndex);
      setCategoryProducts(allCategoryProducts.slice(nextIndex, nextIndex + 4));
    }
  };

  const prevProducts = () => {
    const prevIndex = currentProductIndex - 4;
    if (prevIndex >= 0) {
      setCurrentProductIndex(prevIndex);
      setCategoryProducts(allCategoryProducts.slice(prevIndex, prevIndex + 4));
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

  const renderProductItem = (product: Product) => (
    <div key={product._id} className="product-item">
      <img
        src={product.img_url || '/images/no-image.png'}
        alt={product.name}
        onClick={() => navigate(`/product/${product._id}`)}
        style={{ cursor: 'pointer' }}
      />
      <div className="product-name">{product.name}</div>
      <div>
        <span className="price">{product.price.toLocaleString()}đ</span>
        <span className="discount">-20%</span>
      </div>
      <div className="old-price">{(product.price * 1.2).toLocaleString()}đ</div>
      <button className="add-to-cart" onClick={() => addToCart({ ...product, quantity: 1 })}>
        Thêm vào giỏ
      </button>
    </div>
  );

  const selectedCategoryName = categories.find(c => c._id === selectedCategory)?.name || "Danh mục";
  const selectedCategoryId = selectedCategory;

  return (
    <div className="home-page">
      <section id="banner">
        <div className="container">
          <div className="menu-left">
            <h3>DANH MỤC SẢN PHẨM</h3>
            <ul>
              {categories.map((cate) => (
                <li
                  key={cate._id}
                  onClick={() => navigate(`/product-list?category=${cate._id}`)}
                >
                  {cate.name}
                </li>
              ))}
            </ul>
          </div>
          
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
                  
                  {/* Navigation arrows */}
                  <button className="slider-arrow prev" onClick={prevSlide}>
                    ‹
                  </button>
                  <button className="slider-arrow next" onClick={nextSlide}>
                    ›
                  </button>
                  
                  {/* Dots indicator */}
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
                  <img src="/img/p2.webp" alt="Banner khuyến mãi 1" />
                </div>
                <div className="promo-banner">
                  <img src="/img/p3.webp" alt="Banner khuyến mãi 2" />
                </div>
                <div className="promo-banner">
                  <img src="/img/p4.jpg" alt="Banner khuyến mãi 3" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bottom-long-banner">
          <img src="/img/bannerphu.jpg" alt="Banner dài" />
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
            {categoryProducts.map((product) => (
              <div key={product._id} className="hot-product-card">
                <div className="card-header">
                  <span className="discount-tag">Giảm 13%</span>
                  <span className="installment-tag">Trả góp 0%</span>
                </div>
                <div className="product-image">
                  <img
                    src={product.img_url || '/images/no-image.png'}
                    alt={product.name}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <div className="price-section">
                    <span className="current-price">{product.price.toLocaleString()}₫</span>
                    <span className="original-price">{(product.price * 1.15).toLocaleString()}₫</span>
                  </div>
                  <p className="installment-info">Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...</p>
                  <div className="rating-section">
                    <span className="rating">4.9</span>
                    <span className="star">⭐</span>
                    <span className="heart">💙</span>
                    <span className="like-text">Yêu thích</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="carousel-arrow next" 
            onClick={nextProducts}
            disabled={currentProductIndex + 4 >= allCategoryProducts.length}
          >
            ›
          </button>
        </div>
      </section>

      <section className="km-products">
        <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2> Sản phẩm khuyến mãi</h2>
          <button className="view-all-btn" onClick={() => navigate(`/product-list?category=${selectedCategoryId}`)}>Xem tất cả</button>
        </div>
        <div className="product-list no-scroll">
          {categoryProducts.slice(0, 5).map((product) => (
            <div key={product._id} className="sale-product-card">
              <div className="product-image small">
                <img
                  src={product.img_url || '/images/no-image.png'}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product._id}`)}
                />
              </div>
              <div className="product-details">
                <div className="rating-section">
                  <div className="stars">
                    <span>★★★★★</span>
                    <span className="rating-count">(0)</span>
                  </div>
                  <div className="product-code">MÃ: {product._id.slice(-8).toUpperCase()}</div>
                </div>
                <h4 className="product-name">{product.name}</h4>
                <div className="price-section">
                  <div className="original-price">{(product.price * 1.3).toLocaleString()}₫</div>
                  <div className="savings">(Tiết kiệm: 30%)</div>
                  <div className="current-price">{product.price.toLocaleString()}₫</div>
                </div>
                <div className="availability">
                  <span className="check-icon">✓</span>
                  <span>Sẵn hàng</span>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart({ ...product, quantity: 1 })}
                >
                  🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.map((category) => (
        <section key={category._id} id="qc-gh">
          <div className="wrapper">
            <h2>{category.name}</h2>
            <div className="workstation-section">
              <div className="left-banner">
                <img src="/img/p2.webp" alt={category.name} />
              </div>
              <div className="right-products">
                <div className="filter-buttons">
                  <button>Từ 10 đến 20 Triệu</button>
                  <button>Trên 20 Triệu</button>
                </div>
                <div className="product-grid">
                  {bestSellerProducts
                    .filter(
                      (p) =>
                        typeof p.category_id === 'object' &&
                        (p.category_id as any)._id === category._id
                    )
                    .map((p) => (
                      <div key={p._id} className="product-card">
                        <div className="product-image">
                          <img
                            src={p.img_url || '/images/no-image.png'}
                            alt={p.name}
                            onClick={() => navigate(`/product/${p._id}`)}
                          />
                        </div>
                        <div className="product-details">
                          <div className="rating-section">
                            <div className="stars">
                              <span>★★★★★</span>
                              <span className="rating-count">(0)</span>
                            </div>
                            <div className="product-code">MÃ: {p._id.slice(-8).toUpperCase()}</div>
                          </div>
                          <h4 className="product-name">{p.name}</h4>
                          <div className="price-section">
                            <div className="original-price">{(p.price * 1.3).toLocaleString()}₫</div>
                            <div className="savings">(Tiết kiệm: 30%)</div>
                            <div className="current-price">{p.price.toLocaleString()}₫</div>
                          </div>
                          <div className="availability">
                            <span className="check-icon">✓</span>
                            <span>Sẵn hàng</span>
                          </div>
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => addToCart({ ...p, quantity: 1 })}
                          >
                            🛒
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="load-more">
                  <button onClick={() => navigate(`/product-list?category=${category._id}`)}>Xem thêm</button>
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