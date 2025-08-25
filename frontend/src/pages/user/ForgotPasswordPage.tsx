import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/pages/user/forgotPassword.scss";

import { forgotPassword, resetPassword } from "@/api/user/userAPI";
import { X, Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập địa chỉ email hợp lệ.",
      });
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const response = await forgotPassword({ email });

      if (response.success) {
        console.log(
          "🔧 OTP sent successfully, resetToken:",
          response.resetToken
        );
        setMessage({
          type: "success",
          text:
            response.message ||
            "Mã OTP đã được gửi thành công. Vui lòng kiểm tra email và nhập mã 6 số.",
        });
        setResetToken(response.resetToken);
        setShowOtpInput(true);
        // Không reset email để user có thể thấy email đã nhập
      } else {
        setMessage({
          type: "error",
          text: response.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "Không thể gửi email. Vui lòng thử lại sau.";

      // Xử lý các loại lỗi cụ thể
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập mã OTP 6 số.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    if (!resetToken) {
      setMessage({
        type: "error",
        text: "Token không hợp lệ. Vui lòng gửi lại mã OTP.",
      });
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      console.log("🔧 Sending reset password request:", {
        token: resetToken,
        otp: otp,
        newPassword: newPassword.length,
      });

      const response = await resetPassword({
        token: resetToken,
        otp: otp,
        newPassword: newPassword,
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: response.message || "Mật khẩu đã được đặt lại thành công!",
        });
        // Reset form
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setShowOtpInput(false);
        setResetToken("");
      } else {
        setMessage({
          type: "error",
          text: response.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";

      // Xử lý các loại lỗi cụ thể
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  // Mobile bottom sheet state (consistent with Login/Register)
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const renderForgotForm = () => (
    <form
      className="forgot-password-form-container"
      onSubmit={showOtpInput ? handleResetPassword : handleSendOTP}
    >
      <h2>Quên mật khẩu</h2>

      {message && (
        <div className={`forgot-password-message ${message.type}`}>
          <span className="message-icon">
            {message.type === "success" ? "✅" : "❌"}
          </span>
          {message.text}
        </div>
      )}

      <div className="forgot-password-form-group forgot-password-email-group">
        <input
          type="email"
          placeholder="Vui lòng nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={showOtpInput}
        />
      </div>

      {!showOtpInput ? (
        <>
          <div className="forgot-password-info">
            <p>
              Nhập email của bạn để nhận mã xác thực 6 số. Mã sẽ được gửi đến
              hộp thư của bạn.
            </p>
          </div>

          <button
            type="submit"
            className="forgot-password-submit-btn"
            disabled={sending}
          >
            {sending ? (
              <>
                <span className="spinner"></span>
                Đang gửi mã...
              </>
            ) : (
              "Gửi mã xác thực"
            )}
          </button>
        </>
      ) : (
        <>
          <div className="forgot-password-email-display">
            <p>
              <strong>Email:</strong> {email}
            </p>
            <button
              type="button"
              className="forgot-password-change-email-btn"
              onClick={() => {
                setShowOtpInput(false);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setResetToken("");
                setMessage(null);
              }}
            >
              ✏️ Không phải mail này
            </button>
          </div>

          <div className="forgot-password-form-group forgot-password-otp-group">
            <label>Nhập mã xác thực 6 số:</label>
            <div className="otp-input-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  pattern="[0-9]*"
                  value={otp[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.match(/^[0-9]$/)) {
                      const newOtp = otp.split("");
                      newOtp[index] = value;
                      setOtp(newOtp.join(""));

                      if (index < 5 && value) {
                        const nextInput = (e.target as HTMLInputElement)
                          .parentElement?.children[
                          index + 1
                        ] as HTMLInputElement;
                        nextInput?.focus();
                      }
                    } else if (value === "") {
                      const newOtp = otp.split("");
                      newOtp[index] = "";
                      setOtp(newOtp.join(""));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      if (otp[index]) {
                        const newOtp = otp.split("");
                        newOtp[index] = "";
                        setOtp(newOtp.join(""));
                      } else if (index > 0) {
                        const newOtp = otp.split("");
                        newOtp[index - 1] = "";
                        setOtp(newOtp.join(""));
                        const prevInput = (e.target as HTMLInputElement)
                          .parentElement?.children[
                          index - 1
                        ] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData("text");
                    const numbers = pastedData.replace(/\D/g, "").slice(0, 6);
                    if (numbers.length === 6) {
                      setOtp(numbers);
                      const lastInput = (e.target as HTMLInputElement)
                        .parentElement?.children[5] as HTMLInputElement;
                      lastInput?.focus();
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  className="otp-input"
                  required
                />
              ))}
            </div>
          </div>

          <div className="forgot-password-form-group forgot-password-new-password-group">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="forgot-password-toggle-password"
              aria-label="Ẩn/hiện mật khẩu mới"
              onClick={() => setShowNewPassword((v) => !v)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="forgot-password-form-group forgot-password-confirm-password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="forgot-password-toggle-password"
              aria-label="Ẩn/hiện xác nhận mật khẩu"
              onClick={() => setShowConfirmPassword((v) => !v)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="forgot-password-submit-btn"
            disabled={sending}
          >
            {sending ? (
              <>
                <span className="spinner"></span>
                Đang xử lý...
              </>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </button>
        </>
      )}

      <div className="forgot-password-form-footer">
        <p>
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </form>
  );

  return (
    <div className="forgot-layout-new">
      <div className="forgot-left-column">
        <div className="left-banner-card">
          <div className="banner-icon">🔒</div>
          <div className="banner-text">
            <h2>Bảo vệ tài khoản của bạn</h2>
            <p>
              Sử dụng tính năng quên mật khẩu để đặt lại mật khẩu nhanh chóng và
              an toàn.
            </p>
          </div>
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
              Quên mật khẩu
            </button>
          </div>
        )}
      </div>

      <div className="forgot-right-column">{renderForgotForm()}</div>

      {isMobile && (
        <div
          className={`mobile-forgot-sheet ${isSheetOpen ? "open" : ""}`}
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
            <div className="sheet-content">{renderForgotForm()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
