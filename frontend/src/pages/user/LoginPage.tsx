import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "@/styles/pages/user/login.scss";
import { loginUser } from "@/api/user/userAPI";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, X } from "lucide-react";
import GoogleLoginButton from "@/components/user/GoogleLoginButton";

// Types for auth/login response and router state
interface LoginResponseUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
}
interface LoginResponse {
  token: string;
  user: LoginResponseUser;
}

type LocationState = { from?: { pathname?: string } } | null;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  // Mobile bottom sheet state
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // Helper to read `from` pathname safely
  const getFromPath = (): string => {
    const state = location.state as LocationState;
    const pathname = state?.from?.pathname;
    return pathname && typeof pathname === "string" ? pathname : "/";
  };

  // Theo dõi thay đổi authentication để redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.role?.toLowerCase()?.trim() === "admin";
      const from = getFromPath();
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Kiểm tra ngay khi component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.role?.toLowerCase()?.trim() === "admin";
      const from = getFromPath();
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      const res = (await loginUser({ email, password })) as LoginResponse;

      // Đảm bảo user data có đúng format
      const derivedId = res.user.id || res.user._id || "";
      const userData = {
        _id: derivedId,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
      };

      login(res.token, userData);
      // Redirect sẽ được xử lý bởi useEffect
    } catch (error: unknown) {
      let errorMessage = "Đăng nhập thất bại!";
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Reusable form renderer for desktop and mobile sheet
  const renderLoginForm = () => (
    <div className="register-form-container">
      <h2>
        Đăng nhập <span className="highlight">5AE Linh Kiện</span>
      </h2>

      {errorMsg && <div className="register-error-message">{errorMsg}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="terms-text">
          Trải nghiệm đăng nhập liền mạch tại 5AELinhKien - Nơi cung cấp linh
          kiện điện tử chất lượng cao
        </div>

        <button
          type="submit"
          className="register-button"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "ĐANG ĐĂNG NHẬP..." : "Đăng nhập"}
        </button>

        <div className="register-footer">
          <p>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
        </div>

        <div className="register-footer" style={{ marginTop: 12 }}>
          <p>
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>

        <div
          className="register-footer"
          style={{ background: "transparent", border: "none", padding: 0 }}
        >
          <GoogleLoginButton
            onSuccess={(user) => {
              console.log("Google login successful:", user);
            }}
            onError={(error) => {
              setErrorMsg(`Google login failed: ${error}`);
            }}
          />
        </div>
      </form>
    </div>
  );

  return (
    <div className="register-layout-new">
      <div className="register-left-column">
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

        <div className="trust-section">
          <div className="trust-title">Được tin tưởng bởi</div>
          <div className="trust-logos">
            <div className="trust-logo">🏢</div>
            <div className="trust-logo">🎓</div>
            <div className="trust-logo">🏭</div>
            <div className="trust-logo">💻</div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-text">
            <h3>Bắt đầu hành trình ngay hôm nay!</h3>
            <p>Tham gia cùng chúng tôi để trải nghiệm dịch vụ tốt nhất</p>
          </div>

          {isMobile && (
            <div className="mobile-cta">
              <Link to="/register" className="btn btn-outline">
                Đăng ký
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => setIsSheetOpen(true)}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>

        <div className="decorative-elements">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
          <div className="floating-dots dots-1"></div>
          <div className="floating-dots dots-2"></div>
        </div>
      </div>

      <div className="register-right-column">{renderLoginForm()}</div>

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
            <div className="sheet-content">{renderLoginForm()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
