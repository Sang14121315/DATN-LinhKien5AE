import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/pages/user/register.scss";
import { registerUser } from "@/api/user/userAPI";
import { Eye, EyeOff, X } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [promotionalOptIn, setPromotionalOptIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  // Mobile bottom sheet state
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // Listen screen width for mobile mode
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) return;

    // Validation
    if (formData.password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsRegistering(true);
    setErrorMsg("");

    try {
      const response = await registerUser({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMsg("Đăng ký thành công! Đang chuyển hướng...");

      // Auto login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegisterForm = () => (
    <div className="register-form-container">
      <h2>
        Đăng ký <span className="highlight">5AE Linh Kiện</span>
      </h2>

      {errorMsg && <div className="register-error-message">{errorMsg}</div>}
      {successMsg && (
        <div className="register-success-message">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Thông tin cá nhân</h3>

          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Tạo mật khẩu</h3>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu của bạn"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu *</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu của bạn"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={promotionalOptIn}
              onChange={(e) => setPromotionalOptIn(e.target.checked)}
            />
            <span>Đăng ký nhận tin khuyến mãi từ 5AE Linh Kiện</span>
          </label>
        </div>

        <div className="terms-text">
          Bằng việc Đăng ký, bạn đã đọc và đồng ý với{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Chính sách bảo mật
          </a>{" "}
          của 5AE Linh Kiện.
        </div>

        <button
          type="submit"
          className="register-button"
          disabled={isRegistering}
        >
          {isRegistering ? "Đang đăng ký..." : "Đăng ký ngay"}
        </button>

        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <div className="register-layout-new">
      <div className="register-left-column">
        {/* New Modern Header */}
        <div className="register-header-modern">
          <div className="header-badge">
            <span className="badge-text">🎉 Mới</span>
          </div>
          <h1 className="main-title">
            Chào mừng bạn đến với
            <span className="brand-highlight"> 5AE Linh Kiện</span>
          </h1>
          <p className="subtitle">
            Nơi kết nối cộng đồng công nghệ với những sản phẩm chất lượng cao
          </p>
        </div>

        {/* Floating Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Sản phẩm đa dạng</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Hỗ trợ khách hàng</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Chính hãng</div>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="features-showcase">
          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🚀</div>
            </div>
            <div className="feature-content">
              <h3>Giao hàng siêu tốc</h3>
              <p>Nhận hàng trong vòng 2-4 giờ tại Hà Nội</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🛡️</div>
            </div>
            <div className="feature-content">
              <h3>Bảo hành chính hãng</h3>
              <p>Cam kết 100% sản phẩm chính hãng</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">💎</div>
            </div>
            <div className="feature-content">
              <h3>Ưu đãi độc quyền</h3>
              <p>Giảm giá đặc biệt cho thành viên mới</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-title">Được tin tưởng bởi</div>
          <div className="trust-logos">
            <div className="trust-logo">🏢</div>
            <div className="trust-logo">🎓</div>
            <div className="trust-logo">🏭</div>
            <div className="trust-logo">💻</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-text">
            <h3>Bắt đầu hành trình ngay hôm nay!</h3>
            <p>Tham gia cùng chúng tôi để trải nghiệm dịch vụ tốt nhất</p>
          </div>

          {isMobile && (
            <div className="mobile-cta">
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => setIsSheetOpen(true)}
              >
                Đăng ký ngay
              </button>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
          <div className="floating-dots dots-1"></div>
          <div className="floating-dots dots-2"></div>
        </div>
      </div>

      {/* Right Column - Register Form (hidden on mobile) */}
      <div className="register-right-column">{renderRegisterForm()}</div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <div
          className={`mobile-register-sheet ${isSheetOpen ? "open" : ""}`}
          onClick={() => setIsSheetOpen(false)}
        >
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-drag-handle" />
              <button
                className="sheet-close"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>
            <div className="sheet-content">{renderRegisterForm()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
