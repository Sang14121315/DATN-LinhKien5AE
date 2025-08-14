import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaBell, FaChevronDown, FaSignOutAlt, FaKey } from 'react-icons/fa';
import { getNotificationsByUser, deleteAllNotifications, Notification } from '../../api/notificationAPI';
import { io } from 'socket.io-client';
import '@/styles/components/admin/header.scss';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false); // notification
  const [dropdownOpen, setDropdownOpen] = useState(false); // admin
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('user_id') || '';
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState<string>('ADMIN');
  const { logout } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getNotificationsByUser(userId);
      setNotifications(data);
    } catch (err) {
      console.error('Lỗi khi lấy thông báo', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    socket.emit('join', userId);

    socket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.off('new-notification');
    };
  }, [userId]);

  useEffect(() => {
    if (showDropdown && userId) {
      fetchNotifications();
    }
  }, [showDropdown, userId, fetchNotifications]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) setAdminName(user.name);
      } catch {
        setAdminName('ADMIN');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setShowDropdown(false); // đóng notification khi mở admin dropdown
  };

  const handleToggleNotification = () => {
    setShowDropdown((prev) => !prev);
    setDropdownOpen(false); // đóng admin khi mở notification
  };

  const handleDeleteAll = async () => {
    if (!userId) return;
    try {
      await deleteAllNotifications(userId);
      setNotifications([]);
    } catch (err) {
      console.error('Lỗi khi xóa tất cả thông báo', err);
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'order_placed': return 'Đơn hàng đã đặt';
      case 'order_cancelled': return 'Đơn hàng đã hủy';
      case 'user_feedback': return 'Phản hồi từ người dùng';
      case 'other': return 'Thông báo khác';
      default: return 'Thông báo';
    }
  };

  const handleLogout = () => {
    // Sử dụng logout function từ AuthContext để đảm bảo xóa đúng tất cả dữ liệu
    logout();
    // Navigate đến trang đăng nhập
    navigate('/login');
  };

  const handleChangePassword = () => {
    // Sử dụng logout function từ AuthContext để đảm bảo xóa đúng tất cả dữ liệu
    logout();
    // Navigate đến trang quên mật khẩu
    navigate('/forgot-password');
  };

  return (
    <header className="admin-header">
      <div className="right-section">
        {/* Nút chuông thông báo */}


        {/* Dropdown Thông báo */}
        {showDropdown && (
          <div className="notification-dropdown" ref={notificationRef}>
            <h4>Thông báo</h4>
            <ul className="notification-list">
              {notifications.length === 0 ? (
                <li>Không có thông báo nào</li>
              ) : (
                notifications.map((item) => (
                  <li key={item._id} className={item.read ? 'read' : 'unread'}>
                    <span className="notification-type">{getNotificationTypeText(item.type)}: </span>
                    {item.content}
                    <span className="time">{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                  </li>
                ))
              )}
            </ul>
            {notifications.length > 0 && (
              <div className="notification-actions">
                <button onClick={handleDeleteAll}>Xóa tất cả</button>
                <button className="view-all">Xem tất cả thông báo</button>
              </div>
            )}
          </div>
        )}

        {/* Dropdown Admin */}
        <div
          className={`admin-dropdown${dropdownOpen ? ' open' : ''}`}
          onClick={handleToggleDropdown}
          ref={dropdownRef}
        >
          <span className="admin-text">{adminName}</span>
          <FaChevronDown className="dropdown-icon" />

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleChangePassword(); }}>
                <FaKey style={{ marginRight: 8 }} /> Đổi mật khẩu
              </div>
              <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                <FaSignOutAlt style={{ marginRight: 8 }} /> Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
