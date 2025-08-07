import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "@/styles/pages/user/login.scss";
import { loginUser } from "@/api/user/userAPI";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // Theo dõi thay đổi authentication để redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔍 Login - Authentication changed, user:", user);
      const isAdmin = user.role?.toLowerCase()?.trim() === "admin";
      const from = location.state?.from?.pathname || "/";

      console.log("🔍 Login - isAdmin check:", isAdmin);
      console.log("🔍 Login - user.role:", user.role);
      console.log("🔍 Login - from path:", from);

      if (isAdmin) {
        console.log("🔍 Login - Auto redirecting admin to dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("🔍 Login - Auto redirecting user to:", from);
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Kiểm tra ngay khi component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(
        "🔍 Login - Component mount check, user already authenticated:",
        user
      );
      const isAdmin = user.role?.toLowerCase()?.trim() === "admin";
      const from = location.state?.from?.pathname || "/";

      if (isAdmin) {
        console.log("🔍 Login - Redirecting admin to dashboard on mount");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("🔍 Login - Redirecting user to:", from, "on mount");
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      console.log("🔍 Login - Starting login process...");
      const res = await loginUser({ email, password });

      console.log("🔍 Login - Response received:", res);
      console.log("🔍 Login - Token:", res.token);
      console.log("🔍 Login - User:", res.user);
      console.log("🔍 Login - User role:", res.user?.role);

      // Đảm bảo user data có đúng format
      const userData = {
        _id: res.user.id || res.user._id, // Backend trả về 'id', frontend cần '_id'
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
      };

      console.log("🔍 Login - Processed user data:", userData);

      // Sử dụng login từ AuthContext
      login(res.token, userData);

      console.log(
        "🔍 Login - Token saved to localStorage:",
        localStorage.getItem("token")
      );
      console.log(
        "🔍 Login - User saved to localStorage:",
        localStorage.getItem("user")
      );

      // Redirect sẽ được xử lý bởi useEffect
    } catch (error: unknown) {
      console.error("❌ Login - Error:", error);
      let errorMessage = "Đăng nhập thất bại!";
      // Xử lý lỗi trả về từ axios
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as any;
        if (
          axiosError.response &&
          axiosError.response.data &&
          axiosError.response.data.message
        ) {
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

  return (
    <div className="login-layout">
      {/* Banner trái */}
      <Link
        to="/product/684b0b700a18dcee50370f35"
        className="login-side-banner-link"
      >
        <div className="login-side-banner">
          <img src="/assets/banner-left.png" alt="Banner trái" />
        </div>
      </Link>

      {/* Nội dung chính */}
      <div className="login-main-content">
        <div className="login-top-menu">
          <span>🛡️ Chất lượng đảm bảo</span>
          <span>🚛 Vận chuyển siêu nhanh</span>
          <span>📞 Tư vấn PC</span>
          <span>✉️ Liên hệ</span>
        </div>

        <form className="login-form-container" onSubmit={handleLogin}>
          <div className="login-tabs">
            <span className={location.pathname === "/login" ? "active" : ""}>
              <Link to="/login">Đăng nhập</Link>
            </span>
            <span className={location.pathname === "/register" ? "active" : ""}>
              <Link to="/register">Đăng ký</Link>
            </span>
          </div>

          {errorMsg && <p className="login-error-message">{errorMsg}</p>}

          <div className="login-form-group login-email-group">
            <input
              type="email"
              placeholder="Vui lòng nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group login-password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Vui lòng nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="login-recaptcha-note">
            Trang này được bảo vệ bởi reCAPTCHA và tuân theo Chính sách quyền
            riêng tư cùng Điều khoản dịch vụ của Google.
          </div>

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>

          <div className="login-form-footer">
            <p>
              Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
            <p>
              Bạn quên mật khẩu?{" "}
              <Link to="/forgot-password">Quên mật khẩu</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Banner phải */}
      <Link
        to="/product/684b0b700a18dcee50370f3f"
        className="login-side-banner-link"
      >
        <div className="login-side-banner">
          <img src="/assets/banner-right.png" alt="Banner phải" />
        </div>
      </Link>
    </div>
  );
};

export default LoginPage;
