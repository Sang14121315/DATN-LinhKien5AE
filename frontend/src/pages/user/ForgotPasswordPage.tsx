import React, { useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/pages/user/forgotPassword.scss";

import { forgotPassword, resetPassword } from "@/api/user/userAPI";

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
          onSubmit={showOtpInput ? handleResetPassword : handleSendOTP}
        >
          <div className="forgot-password-tabs">
            <span>
              <Link to="/login">Đăng nhập</Link>
            </span>
            <span className="active">Quên mật khẩu</span>
          </div>

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
                  Nhập email của bạn để nhận mã xác thực 6 số. Mã sẽ được gửi
                  đến hộp thư của bạn.
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
                        // Chỉ cho phép số
                        if (value.match(/^[0-9]$/)) {
                          const newOtp = otp.split("");
                          newOtp[index] = value;
                          setOtp(newOtp.join(""));

                          // Tự động focus vào ô tiếp theo
                          if (index < 5 && value) {
                            const nextInput = (e.target as HTMLInputElement)
                              .parentElement?.children[
                              index + 1
                            ] as HTMLInputElement;
                            nextInput?.focus();
                          }
                        } else if (value === "") {
                          // Cho phép xóa (khi value rỗng)
                          const newOtp = otp.split("");
                          newOtp[index] = "";
                          setOtp(newOtp.join(""));
                        }
                      }}
                      onKeyDown={(e) => {
                        // Xử lý backspace để xóa và focus về ô trước
                        if (e.key === "Backspace") {
                          if (otp[index]) {
                            // Nếu ô hiện tại có số, xóa số đó
                            const newOtp = otp.split("");
                            newOtp[index] = "";
                            setOtp(newOtp.join(""));
                          } else if (index > 0) {
                            // Nếu ô hiện tại trống và không phải ô đầu, xóa ô trước
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
                        const numbers = pastedData
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        if (numbers.length === 6) {
                          setOtp(numbers);
                          // Focus vào ô cuối cùng sau khi paste
                          const lastInput = (e.target as HTMLInputElement)
                            .parentElement?.children[5] as HTMLInputElement;
                          lastInput?.focus();
                        }
                      }}
                      onFocus={(e) => {
                        // Select toàn bộ text khi focus
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
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="forgot-password-form-group forgot-password-confirm-password-group">
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
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
