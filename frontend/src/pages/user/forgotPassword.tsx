import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '@/styles/pages/user/forgotPassword.scss';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      setMessage('❌ Vui lòng nhập địa chỉ email hợp lệ.');
      setMessageType('error');
      return;
    }

    try {
      setSending(true);
      setMessage(null);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage('📨 Mã xác thực đã được gửi đến email của bạn.');
      setMessageType('success');
      setShowOtpInput(true);
    } catch (error) {
      setMessage('❌ Đã xảy ra lỗi khi gửi mã. Vui lòng thử lại.');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setMessage('❌ Vui lòng nhập mã xác thực.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Mật khẩu xác nhận không khớp.');
      setMessageType('error');
      return;
    }

    // TODO: Gọi API đổi mật khẩu tại đây
    console.log('Đổi mật khẩu cho:', email, newPassword, 'OTP:', otp);
    setMessage('✅ Mật khẩu của bạn đã được đặt lại thành công!');
    setMessageType('success');
  };

  return (
    <div className="login-layout">
      <aside className="sidebar">
        <h4>📋 DANH MỤC SẢN PHẨM</h4>
        <ul>
          <li>PC Gaming - Máy tính chơi game</li>
          <li>PC Workstation</li>
          <li>Tự Build Cấu Hình PC</li>
          <li>PC VĂN PHÒNG</li>
          <li>PC AMD GAMING</li>
          <li>PC Core Ultra</li>
          <li>PC GAMING ĐẸP – CAO CẤP</li>
          <li>PC GIẢ LẬP - ẢO HÓA</li>
          <li>PC MINI</li>
          <li>PC Refurbished</li>
        </ul>
      </aside>

      <div className="main-auth-content">
        <div className="top-menu">
          <span>🛡️ Chất lượng đảm bảo</span>
          <span>🚛 Vận chuyển siêu nhanh</span>
          <span>📞 Tư vấn PC</span>
          <span>✉️ Liên hệ</span>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <span><Link to="/login">Đăng nhập</Link></span>
            <span className="active">Quên mật khẩu</span>
          </div>

          <form onSubmit={handleSubmit}>
            {message && (
              <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <div className="form-group with-button">
              <input
                type="email"
                placeholder="Vui lòng nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-send"
                onClick={handleSendCode}
                disabled={sending}
              >
                {sending ? 'Đang gửi...' : 'Gửi mã'}
              </button>
            </div>

            {showOtpInput && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập mã xác thực"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="password"
                placeholder="Vui lòng nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Xác nhận lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="recaptcha-note">
              Trang này được bảo vệ bởi reCAPTCHA và tuân theo Chính sách quyền riêng tư cùng Điều khoản dịch vụ của Google.
            </div>

            <button type="submit" className="submit-button">XÁC NHẬN</button>

            <div className="form-footer">
              <p>Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
              <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
