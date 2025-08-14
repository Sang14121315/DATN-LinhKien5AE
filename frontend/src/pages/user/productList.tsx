import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaShoppingCart, FaRegHeart, FaHeart } from "react-icons/fa";
import { Row, Col, Grid } from "antd";
import "@/styles/pages/user/productList.scss";
import axios from "axios";

import { useCart } from "@/context/CartContext";
import { useFavorite } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";
import { Product, fetchFilteredProducts } from "@/api/user/productAPI";
import { Brand, fetchAllBrands } from "@/api/user/brandAPI";
import { Category, fetchAllCategories, fetchCategoriesByProductType } from "@/api/user/categoryAPI";
import { ProductType, fetchAllProductTypes } from "@/api/user/productTypeAPI";

const ProductListPage: React.FC = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams] = useSearchParams();

  const [expandedProductType, setExpandedProductType] = useState<string | null>(null);
  const [productTypeCategories, setProductTypeCategories] = useState<Record<string, Category[]>>({});

  const navigate = useNavigate();
  const itemsPerPage = 16;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const { addToCart } = useCart();
  const { addToFavorite, removeFromFavorite, favorites } = useFavorite();
  const { user } = useAuth();

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Load danh mục, thương hiệu, loại sản phẩm
  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandData, categoryData, productTypeData] = await Promise.all([
          fetchAllBrands(),
          fetchAllCategories(),
          fetchAllProductTypes(),
        ]);
        setBrands(brandData);
        setCategories(categoryData);
        setProductTypes(productTypeData);

        const categoriesByProductType: Record<string, Category[]> = {};
        for (const productType of productTypeData) {
          const categories = await fetchCategoriesByProductType(productType._id);
          categoriesByProductType[productType._id] = categories;
        }
        setProductTypeCategories(categoriesByProductType);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    loadData();
  }, []);

  // Load filters từ URL hoặc sessionStorage
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      const saved = sessionStorage.getItem("productFilters");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedCategory(parsed.category || "all");
        setSelectedBrand(parsed.brand || "all");
        setSelectedPrice(parsed.price || "all");
        setTimeout(() => window.scrollTo(0, parsed.scroll || 0), 50);
      }
    }
    setFiltersInitialized(true);
  }, [searchParams]);

const getImageUrl = (url?: string): string => {
  if (!url) return '/images/no-image.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return `http://localhost:5000/uploads/products/${url}`;
};

  // Lọc sản phẩm theo bộ lọc
  useEffect(() => {
    if (!filtersInitialized) return;

    const fetchProducts = async () => {
      try {
        const filters: { category_id?: string; brand_id?: string; minPrice?: number; maxPrice?: number } = {};

        if (selectedCategory !== "all") filters.category_id = selectedCategory;
        if (selectedBrand !== "all") filters.brand_id = selectedBrand;
        if (selectedPrice !== "all") {
          const [min, max] = selectedPrice.split("-").map(Number);
          filters.minPrice = min;
          filters.maxPrice = max;
        }

        const productData = await fetchFilteredProducts(filters);
        setProducts(productData);
        setCurrentPage(1);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedPrice, filtersInitialized]);

  const toggleProductType = (productTypeId: string) => {
    setExpandedProductType(expandedProductType === productTypeId ? null : productTypeId);
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

  return (
    <div className="product-page-container">
      <div className="product-layout">
        {/* Sidebar */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={6} lg={5} className="sidebar">
            <div className="sidebar-section">
              <div className="dropdown-header">
                <span>DANH MỤC SẢN PHẨM</span>
              </div>
              <ul className="dropdown-content">
                <li onClick={() => setSelectedCategory("all")} className={selectedCategory === "all" ? "active" : ""}>
                  TẤT CẢ SẢN PHẨM
                </li>
                {productTypes.map((productType) => (
                  <React.Fragment key={productType._id}>
                    <li
                      className={`product-type-item ${expandedProductType === productType._id ? "expanded" : ""}`}
                      onClick={() => toggleProductType(productType._id)}
                    >
                      {productType.name.toUpperCase()}
                      <span className="dropdown-icon">{expandedProductType === productType._id ? "▼" : "▶"}</span>
                    </li>
                    {expandedProductType === productType._id && (
                      <div className="sub-categories">
                        {productTypeCategories[productType._id]?.map((category) => (
                          <li
                            key={category._id}
                            onClick={() => setSelectedCategory(category._id)}
                            className={selectedCategory === category._id ? "active" : ""}
                          >
                            {category.name}
                          </li>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>

            {/* Lọc giá */}
            <div className="sidebar-section">
              <h3>LỌC GIÁ</h3>
              <div className="price-radio-group">
                {[
                  ["all", "Tất cả"],
                  ["0-10000", "Dưới 10.000đ"],
                  ["10000-30000", "10k – 30k"],
                  ["30000-50000", "30k – 50k"],
                  ["50000-100000", "50k – 100k"],
                  ["100000-200000", "100k – 200k"],
                  ["200000-999999999", "Trên 200k"],
                ].map(([value, label]) => (
                  <label className="price-radio" key={value}>
                    <input
                      type="radio"
                      name="price"
                      value={value}
                      checked={selectedPrice === value}
                      onChange={() => setSelectedPrice(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div className="sidebar-banner">
              <img src="/public/assets/about_vertical_sale_banner.png" alt="Giảm giá sốc" />
              <img src="/public/assets/about_vertical_sale2_banner.png" alt="Giảm giá sốc" />
            </div>
          </Col>

          {/* Main content */}
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
                {brands.map((b) => (
                  <div
                    className={`brand-item ${selectedBrand === b._id ? "selected" : ""}`}
                    key={b._id}
                    onClick={() => setSelectedBrand(b._id)}
                  >
                    <img
                      src={b.logo_url || b.logo_data || "/public/assets/default_brand_logo.png"}
                      alt={b.name}
                      className="brand-logo"
                      title={b.name}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="product-header">
              <h2>
                {selectedCategory === "all"
                  ? "Sản phẩm"
                  : categories.find((c) => c._id === selectedCategory)?.name || "Sản phẩm"}
              </h2>
            </div>

            <Row gutter={[16, 16]} className="product-grid">
              {products.length > 0 ? (
                paginatedProducts.map((product) => {
                  const isFavorite = favorites.some((f) => f._id === product._id);
                  return (
                    <Col xs={12} sm={8} md={6} lg={6} key={product._id}>
                      <div className="product-card">
                        <img
                          src={product.img_url}
                          alt={product.name}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            sessionStorage.setItem(
                              "productFilters",
                              JSON.stringify({
                                category: selectedCategory,
                                brand: selectedBrand,
                                price: selectedPrice,
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
                          {isFavorite ? <FaHeart /> : <FaRegHeart />}
                        </button>
                        <p className="product-brand">
                          {typeof product.brand_id === "object" ? product.brand_id.name : product.brand_id}
                        </p>
                        <h4 className="product-name">{product.name}</h4>


                        <div className="price-block">
                          <div className="price-left">
                            {product.sale ? (
                              <>
                                <div className="discount-price">{formatCurrency(product.price * 0.66)}</div>
                                <div className="original-price">{formatCurrency(product.price)}</div>
                              </>
                            ) : (
                              <div className="discount-price">{formatCurrency(product.price)}</div>
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
                              img_url: product.img_url,
                            })
                          }
                        >
                          <FaShoppingCart /> Thêm vào giỏ
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