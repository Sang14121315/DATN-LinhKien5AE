import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";
import "@/styles/components/user/header.scss";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartSidebar from "@/components/user/CartSidebar";
import { searchProductsAPI } from "@/api/user/searchAPI";
import { Product } from "@/api/user/productAPI";

const Header: React.FC = () => {
  const { totalQuantity } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setShowMobileMenu(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        searchProductsAPI(value.trim())
          .then((res) => {
            setSearchResults(res.slice(0, 4));
            setShowSearchDropdown(true);
          })
          .catch(() => {
            setSearchResults([]);
            setShowSearchDropdown(false);
          });
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);
  };

  const handleGoToList = () => {
    navigate(`/search?query=${encodeURIComponent(searchKeyword.trim())}`);
    setShowSearchDropdown(false);
  };

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Hàm xử lý cắt ngắn tên user
  const truncateUserName = (name: string): string => {
    if (name.length > 12) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <div className="marquee-container">
          <div className="marquee-content">
            <span>🔌 Linh kiện xịn - Giá tốt - Bảo hành dài</span>
            <span className="separator">•</span>
            <span>🚛 Giao nhanh 2h - Free ship 200K</span>
            <span className="separator">•</span>
            <span>🔄 Thu cũ - Đổi mới - Giá cao</span>
            <span className="separator">•</span>
            <span>📞 Tư vấn kỹ thuật: 123456789</span>
            <span className="separator">•</span>
            <span>🔌 Linh kiện xịn - Giá tốt - Bảo hành dài</span>
            <span className="separator">•</span>
            <span>🚛 Giao nhanh 2h - Free ship 200K</span>
            <span className="separator">•</span>
            <span>🔄 Thu cũ - Đổi mới - Giá cao</span>
            <span className="separator">•</span>
            <span>📞 Tư vấn kỹ thuật: 123456789</span>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <div className="header-main">
            <Row align="middle" justify="space-between" className="header-row">
              {/* Logo */}
              <Col xs={4} sm={4} md={3} className="header__logo">
                <Link to="/">
                  <span className="logo-desktop"><img src="./src/assets/Logo.png" alt="" /></span>
                  <span className="logo-mobile">5AE</span>
                </Link>
              </Col>

              {/* Search */}
              <Col xs={16} sm={12} md={10} className="header__search">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Tìm kiếm linh kiện..."
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true);
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowSearchDropdown(false), 200)
                    }
                  />
                  <button onClick={handleGoToList}>
                    <FaSearch />
                  </button>
                </div>
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="search-dropdown">
                    {searchResults.map((item) => (
                      <div
                        key={item._id}
                        className="dropdown-item"
                        onMouseDown={() => {
                          navigate(`/product/${item._id}`);
                          setShowSearchDropdown(false);
                        }}
                      >
                        <div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-price">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                        <img src={item.img_url} alt={item.name} />
                      </div>
                    ))}
                    <div className="see-more" onMouseDown={handleGoToList}>
                      Xem thêm sản phẩm
                    </div>
                  </div>
                )}
              </Col>

              {/* Nav menu */}
              <Col xs={0} sm={6} md={7} className="header__nav">
                <nav>
                  <Link to="/" className="nav-item">Trang chủ</Link>
                  <Link to="/productlist" className="nav-item">Sản phẩm</Link>
                  <Link to="/contact" className="nav-item">Liên hệ</Link>
                  <Link to="/about" className="nav-item">Giới thiệu</Link>
                </nav>
              </Col>

              {/* User + Cart (Desktop only) */}
              <Col xs={0} sm={2} md={4} className="header__actions">
                <div className="header__auth-cart-group">
                  <div className="header__auth" ref={userDropdownRef}>
                    {user ? (
                      <div className="header__user-dropdown">
                        <div
                          className="auth-user user-vertical"
                          onClick={() => setShowUserDropdown((prev) => !prev)}
                        >
                          <FaUserCircle className="user-icon" />
                          <div className="user-info-vertical">
                            <span className="user-name">{truncateUserName(user.name)}</span>
                            <span className="user-arrow">▼</span>
                          </div>
                        </div>
                        {showUserDropdown && (
                          <div className="dropdown-menu">
                            <div className="dropdown-item" onClick={() => navigate("/profile")}>Hồ sơ</div>
                            <div className="dropdown-item" onClick={() => navigate("/favorite")}>Yêu thích</div>
                            <div className="dropdown-item" onClick={() => navigate("/purchase")}>Đơn mua</div>
                            <div className="dropdown-item" onClick={handleLogout}>Đăng xuất</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link to="/login" className="auth-link">
                        <FaUserCircle />
                      </Link>
                    )}
                  </div>
                  <div className="header__cart-wrapper">
                    <button
                      className="header__cart"
                      onClick={() => setIsOpen(true)}
                    >
                      <FaShoppingCart className="icon" />
                      {isAuthenticated && totalQuantity > 0 && (
                        <span className="cart-count">{totalQuantity}</span>
                      )}
                    </button>
                  </div>
                </div>
              </Col>

              {/* Hamburger menu (của mobie) */}
              <Col xs={4} sm={0} md={0} className="header__mobile-menu-btn">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="mobile-menu-button"
                >
                  <MenuOutlined />
                </button>
              </Col>
            </Row>
            {/* Dropdown menu của mobile */}
            {showMobileMenu && (
              <>
                <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)} />
                <div className="mobile-menu-drawer">
                  <div className="mobile-menu-content">
                    <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
                      ×
                    </button>
                    <nav className="mobile-nav">
                      <Link to="/" className="nav-item" onClick={() => setShowMobileMenu(false)}>Trang chủ</Link>
                      <Link to="/productlist" className="nav-item" onClick={() => setShowMobileMenu(false)}>Sản phẩm</Link>
                      <Link to="/contact" className="nav-item" onClick={() => setShowMobileMenu(false)}>Liên hệ</Link>
                      <Link to="/about" className="nav-item" onClick={() => setShowMobileMenu(false)}>Giới thiệu</Link>
                      <div className="nav-item" onClick={() => { setIsOpen(true); setShowMobileMenu(false); }}>
                        <FaShoppingCart className="nav-icon" /> Giỏ hàng
                        {isAuthenticated && totalQuantity > 0 && (
                          <span className="cart-count">{totalQuantity}</span>
                        )}
                      </div>
                      {user ? (
                        <div className="header__user-dropdown nav-item" ref={userDropdownRef}>
                          <div
                            className="auth-user"
                            onClick={() => setShowUserDropdown((prev) => !prev)}
                          >
                            <FaUserCircle className="nav-icon" /> {truncateUserName(user.name)}
                          </div>
                          {showUserDropdown && (
                            <div className="dropdown-menu">
                              <div className="dropdown-item" onClick={() => { navigate("/profile"); setShowMobileMenu(false); }}>Hồ sơ</div>
                              <div className="dropdown-item" onClick={() => { navigate("/favorite"); setShowMobileMenu(false); }}>Yêu thích</div>
                              <div className="dropdown-item" onClick={() => { navigate("/forgot-password"); setShowMobileMenu(false); }}>Quên mật khẩu</div>
                              <div className="dropdown-item" onClick={handleLogout}>Đăng xuất</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link to="/login" className="nav-item" onClick={() => setShowMobileMenu(false)}>
                          <FaUserCircle className="nav-icon" /> Đăng nhập
                        </Link>
                      )}
                     
                    </nav>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Header;