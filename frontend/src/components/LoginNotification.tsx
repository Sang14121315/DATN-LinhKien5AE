import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '@/styles/components/loginNotification.scss';

interface LoginNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginNotification: React.FC<LoginNotificationProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`login-notification-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div className="login-notification" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <div className="icon-container">
            <FaUserLock className="lock-icon" />
          </div>
          <button className="close-button" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="notification-content">
          <h3>🔐 Yêu cầu đăng nhập</h3>
          <p>Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!</p>
        </div>
        
        <div className="notification-actions">
          <button className="login-button" onClick={handleLogin}>
            Đăng nhập ngay
          </button>
          <button className="cancel-button" onClick={handleClose}>
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginNotification; 