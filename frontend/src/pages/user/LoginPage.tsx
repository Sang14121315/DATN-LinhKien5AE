import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "@/styles/pages/user/login.scss";
import { loginUser } from "@/api/user/userAPI";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Gift, X } from "lucide-react";

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
    <div className="login-form-container">
      <h2>
        Đăng nhập <span className="highlight">5AE Linh Kiện</span>
      </h2>

      {errorMsg && <p className="login-error-message">{errorMsg}</p>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
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
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="login-info-box">
          <p>
            Trải nghiệm đăng nhập liền mạch tại 5AELinhKien - Nơi cung cấp linh
            kiện điện tử chất lượng cao
          </p>
        </div>

        <button type="submit" className="login-button" disabled={isLoggingIn}>
          {isLoggingIn ? "ĐANG ĐĂNG NHẬP..." : "Đăng nhập"}
        </button>

        <div className="login-links">
          <Link to="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="register-link">
          <p>
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <div className="login-layout-new">
      {/* Left Column - 5AELinhKien Benefits */}
      <div className="login-left-column">
        <div className="smember-header">
          <h1>
            Nhập hội khách hàng thành viên{" "}
            <span className="highlight">5AE Linh Kiện</span>
          </h1>
          <p>Để không bỏ lỡ các ưu đãi hấp dẫn từ 5AELinhKien</p>
        </div>

        <div className="smember-benefits">
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Giảm giá linh kiện điện tử chất lượng cao</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Miễn phí giao hàng cho đơn hàng từ 500.000₫</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Tư vấn kỹ thuật chuyên nghiệp 24/7</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Bảo hành chính hãng, đổi trả dễ dàng</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Ưu đãi đặc biệt cho khách hàng thân thiết</span>
          </div>
          <div className="benefit-item">
            <Gift className="benefit-icon" />
            <span>Hỗ trợ lắp ráp và cài đặt tại nhà</span>
          </div>
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

        <div className="smember-illustration">
          <div className="character">
            <div className="character-body"></div>
            <div className="character-antennae"></div>
            <div className="character-shoes"></div>
            <div className="gift-box"></div>
          </div>
          <div className="vouchers">
            <div className="voucher">10k</div>
            <div className="voucher">20%</div>
            <div className="voucher">5%</div>
            <div className="voucher">50k</div>
          </div>
          <div className="stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form (hidden on mobile) */}
      <div className="login-right-column">{renderLoginForm()}</div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <div
          className={`mobile-login-sheet ${isSheetOpen ? "open" : ""}`}
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
