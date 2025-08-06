import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/pages/user/register.scss";
import { registerUser } from "@/api/user/userAPI";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const result = await registerUser({
        name: fullName,
        email,
        password,
        phone,
        address,
      });
      // Lưu token vào localStorage nếu cần
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      setErrorMsg("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại!";
      setErrorMsg(errorMessage);
    }
  };

  return (
    <div className="register-layout">
      {/* Banner trái - Link tới sản phẩm 684b0b700a18dcee50370f35 */}
      <Link
        to="/product/684b0b700a18dcee50370f35"
        className="register-side-banner-link"
      >
        <div className="register-side-banner">
          <img src="/assets/banner-left.png" alt="Banner trái" />
        </div>
      </Link>

      {/* Nội dung chính */}
      <div className="register-main-content">
        <div className="register-top-menu">
          <span>🛡️ Chất lượng đảm bảo</span>
          <span>🚛 Vận chuyển siêu nhanh</span>
          <span>📞 Tư vấn PC</span>
          <span>✉️ Liên hệ</span>
        </div>

        <form className="register-form-container" onSubmit={handleSubmit}>
          <div className="register-tabs">
            <span>
              <Link to="/login">Đăng nhập</Link>
            </span>
            <span className="active">Đăng ký</span>
          </div>

          {errorMsg && <p className="register-error-message">{errorMsg}</p>}

          <div className="register-form-group register-name-group">
            <input
              type="text"
              placeholder="Vui lòng nhập họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group register-email-group">
            <input
              type="email"
              placeholder="Vui lòng nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group register-phone-group">
            <input
              type="tel"
              placeholder="Vui lòng nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group register-address-group">
            <input
              type="text"
              placeholder="Vui lòng nhập địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group register-password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Vui lòng nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="register-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="register-form-group register-confirm-password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="register-toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="register-recaptcha-note">
            Trang này được bảo vệ bởi reCAPTCHA và tuân theo Chính sách quyền
            riêng tư cùng Điều khoản dịch vụ của Google.
          </div>

          <button type="submit">ĐĂNG KÝ</button>

          <div className="register-form-footer">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Banner phải - Link tới sản phẩm 684b0b700a18dcee50370f3f */}
      <Link
        to="/product/684b0b700a18dcee50370f3f"
        className="register-side-banner-link"
      >
        <div className="register-side-banner">
          <img src="/assets/banner-right.png" alt="Banner phải" />
        </div>
      </Link>
    </div>
  );
};

export default RegisterPage;
