import React, { useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/pages/user/forgotPassword.scss";
import { Eye, EyeOff } from "lucide-react";
import {
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
} from "@/api/user/userAPI";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setMessage("❌ Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const res = await sendForgotPasswordOTP({ email }); // <-- Gọi API thực
      setMessage("✅ " + res.message);
      setShowOtpInput(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gửi mã thất bại.";
      setMessage("❌ " + errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setMessage("❌ Vui lòng nhập mã xác thực.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const res = await resetPasswordWithOTP({
        email,
        otp,
        newPassword,
      });

      if (res.success) {
        setMessage("✅ " + res.message);
        // Reset form
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setShowOtpInput(false);
      } else {
        setMessage("❌ " + res.message);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại.";
      setMessage("❌ " + errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="forgot-password-layout">
      {/* Banner trái - Link tới sản phẩm 684b0b700a18dcee50370f35 */}
      <Link
        to="/product/684b0b700a18dcee50370f35"
        className="forgot-password-side-banner-link"
      >
        <div className="forgot-password-side-banner">
          <img src="/assets/banner-left.png" alt="Banner trái" />
        </div>
      </Link>

      {/* Nội dung chính */}
      <div className="forgot-password-main-content">
        <div className="forgot-password-top-menu">
          <span>🛡️ Chất lượng đảm bảo</span>
          <span>🚛 Vận chuyển siêu nhanh</span>
          <span>📞 Tư vấn PC</span>
          <span>✉️ Liên hệ</span>
        </div>

        <form
          className="forgot-password-form-container"
          onSubmit={handleSubmit}
        >
          <div className="forgot-password-tabs">
            <span>
              <Link to="/login">Đăng nhập</Link>
            </span>
            <span className="active">Quên mật khẩu</span>
          </div>

          {message && (
            <p className="forgot-password-error-message">{message}</p>
          )}

          <div className="forgot-password-form-group forgot-password-email-group">
            <input
              type="email"
              placeholder="Vui lòng nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="button"
              className="forgot-password-btn-send"
              onClick={handleSendCode}
              disabled={sending}
            >
              {sending ? "Đang gửi..." : "Gửi mã"}
            </button>
          </div>

          {showOtpInput && (
            <>
              <div className="forgot-password-form-group forgot-password-otp-group">
                <input
                  type="text"
                  placeholder="Nhập mã xác thực"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="forgot-password-form-group forgot-password-new-password-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Vui lòng nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="forgot-password-toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="forgot-password-form-group forgot-password-confirm-password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="forgot-password-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </>
          )}

          <div className="forgot-password-recaptcha-note">
            Trang này được bảo vệ bởi reCAPTCHA và tuân theo Chính sách quyền
            riêng tư cùng Điều khoản dịch vụ của Google.
          </div>

          <button type="submit">XÁC NHẬN</button>

          <div className="forgot-password-form-footer">
            <p>
              Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </form>
      </div>

      {/* Banner phải - Link tới sản phẩm 684b0b700a18dcee50370f3f */}
      <Link
        to="/product/684b0b700a18dcee50370f3f"
        className="forgot-password-side-banner-link"
      >
        <div className="forgot-password-side-banner">
          <img src="/assets/banner-right.png" alt="Banner phải" />
        </div>
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;
