import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/components/user/header.scss";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/user/CartSidebar";
import { searchProductsAPI } from "@/api/user/searchAPI";
import { Product } from "@/api/user/productAPI";

const Header: React.FC = () => {
  const { totalQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const timeoutRef = useRef<any>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        searchProductsAPI(value.trim())
          .then((res) => {
            setSearchResults(res.slice(0, 5));
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
      <header className="header">
        <div className="container">
          {/* Logo */}
          <div className="header__logo">
            <Link to="/">🖥 5AE</Link>
          </div>

          {/* Search */}
          <div className="header__search">
            <input
              type="text"
              placeholder="Tìm kiếm linh kiện..."
              value={searchKeyword}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            />
            <button onClick={handleGoToList}>
              <FaSearch />
            </button>

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
          </div>

          {/* Auth */}
          <div className="header__auth" ref={userDropdownRef}>
            {user ? (
              <div className="header__user-dropdown">
                <div
                  className="auth-user"
                  onClick={() => setShowUserDropdown((prev) => !prev)}
                >
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{user.name} ▼</span>
                </div>

                {showUserDropdown && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Quên mật khẩu
                    </div>
                    <div className="dropdown-item" onClick={handleLogout}>
                      Đăng xuất
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="auth-link">
                <FaUserCircle />
              </Link>
            )}
          </div>

          {/* Cart */}
          <div className="header__actions">
            <button className="header__cart" onClick={() => setIsOpen(true)}>
              <FaShoppingCart className="icon" />
              {totalQuantity > 0 && (
                <span className="cart-count">{totalQuantity}</span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="main-nav-container">
          <div className="main-nav-wrapper">
            <div className="nav-menu">
              <Link to="/" className="nav-item">
                Trang chủ
              </Link>
              <Link to="/productlist" className="nav-item">
                Sản phẩm
              </Link>
              <Link to="/contact" className="nav-item">
                Liên hệ
              </Link>
              <Link to="/about" className="nav-item">
                Giới thiệu
              </Link>
            </div>
            <div className="nav-right-info">
              <span className="info-item">Chất lượng đảm bảo</span>
              <span className="info-item">Vận chuyển siêu tốc</span>
              <span className="info-item">Tư vấn: 0123456789</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar giỏ hàng */}
      <CartSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Header;
