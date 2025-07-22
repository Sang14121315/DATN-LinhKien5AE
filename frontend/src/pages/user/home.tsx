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

  const navigate = useNavigate();
  const { addToCart } = useCart();

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
            <div className="top-menu">
              <div className="menu-item"><span>🛡️</span> <span>Chất lượng đảm bảo</span></div>
              <div className="menu-item"><span>🚛</span> <span>Vận chuyển siêu nhanh</span></div>
              <div className="menu-item"><span>📞</span> <span>Tư vấn: 0336713116 </span></div>
            </div>
            <div className="top-banner">
              <img src="/img/anh2.jpg" alt="Banner" />
            </div>
          </div>
        </div>
        <div className="bottom-images">
          {["anh2.jpg", "banner 1.webp", "slide_1_img.webp", "slide_3_img.jpg"].map((img, i) => (
            <img key={i} src={`/img/${img}`} alt={`Ảnh ${i + 1}`} />
          ))}
        </div>
      </section>

      <section className="hot-products">
        <h2>Sản phẩm nổi bật</h2>
        <div className="product-list">
          {hotProducts.map(renderProductItem)}
        </div>
      </section>

      <section className="km-products">
        <h2>Sản phẩm khuyến mãi</h2>
        <div className="product-list">
          {saleProducts.map(renderProductItem)}
        </div>
      </section>

      <section className="km-products">
        <h2>Sản phẩm bán chạy</h2>
        <div className="product-list">
          {bestSellerProducts.map(renderProductItem)}
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
                        <img
                          src={p.img_url || '/images/no-image.png'}
                          alt={p.name}
                          onClick={() => navigate(`/product/${p._id}`)}
                          style={{ cursor: 'pointer' }}
                        />
                        <h4>{p.name}</h4>
                        <div className="price">{p.price.toLocaleString()}đ</div>
                        <div className="old-price">{(p.price * 1.2).toLocaleString()}đ</div>
                        <div className="discount">-20%</div>
                        <button onClick={() => addToCart({ ...p, quantity: 1 })}>Thêm vào giỏ</button>
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

      <section className="gaming-gear-section">
        <h2>GAMING GEAR</h2>
        <div className="gear-list">
          {bestSellerProducts.slice(0, 6).map((p) => (
            <div key={p._id} className="gear-item">
              <img
                src={p.img_url || '/images/no-image.png'}
                alt={p.name}
                onClick={() => navigate(`/product/${p._id}`)}
                style={{ cursor: 'pointer' }}
              />
              <div className="gear-info">
                <p className="gear-name">{p.name}</p>
                <div className="gear-price">
                  <span className="new-price">{p.price.toLocaleString()}đ</span>
                  <span className="old-price">{(p.price * 1.1).toLocaleString()}đ</span>
                  <span className="discount">-10%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;