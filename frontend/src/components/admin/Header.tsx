import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaBell, FaChevronDown, FaSignOutAlt, FaKey } from "react-icons/fa";
import {
  getNotificationsByUser,
  deleteAllNotifications,
  Notification,
} from "../../api/notificationAPI";
import { io } from "socket.io-client";
import "@/styles/components/admin/header.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  changeAdminPassword,
  ChangePasswordData,
} from "../../api/user/userAPI";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

// Eye icon component
const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const Header: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false); // notification
  const [dropdownOpen, setDropdownOpen] = useState(false); // admin
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("user_id") || "";
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState<string>("ADMIN");
  const { logout } = useAuth();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (
    field: keyof ChangePasswordData,
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };
  const handleChangePassword = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !confirmPassword
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (passwordData.newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    try {
      setChangingPassword(true);
      const result = await changeAdminPassword(passwordData);
      if (result.success) {
        alert(result.message);
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "" });
        setConfirmPassword("");
      } else {
        alert(result.message || "Có lỗi xảy ra khi đổi mật khẩu!");
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!"
      );
    } finally {
      setChangingPassword(false);
    }
  };
  const handleChangePasswordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowChangePasswordModal(true);
  };

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getNotificationsByUser(userId);
      setNotifications(data);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    socket.emit("join", userId);

    socket.on("new-notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [userId]);

  useEffect(() => {
    if (showDropdown && userId) {
      fetchNotifications();
    }
  }, [showDropdown, userId, fetchNotifications]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) setAdminName(user.name);
      } catch {
        setAdminName("ADMIN");
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      console.error("Lỗi khi xóa tất cả thông báo", err);
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "order_placed":
        return "Đơn hàng đã đặt";
      case "order_cancelled":
        return "Đơn hàng đã hủy";
      case "user_feedback":
        return "Phản hồi từ người dùng";
      case "other":
        return "Thông báo khác";
      default:
        return "Thông báo";
    }
  };

  const handleLogout = () => {
    // Sử dụng logout function từ AuthContext để đảm bảo xóa đúng tất cả dữ liệu
    logout();
    // Navigate đến trang đăng nhập
    navigate("/login");
  };

  const handleChangePassword = () => {
    // Sử dụng logout function từ AuthContext để đảm bảo xóa đúng tất cả dữ liệu
    logout();
    // Navigate đến trang quên mật khẩu
    navigate("/forgot-password");
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
                  <li key={item._id} className={item.read ? "read" : "unread"}>
                    <span className="notification-type">
                      {getNotificationTypeText(item.type)}:{" "}
                    </span>
                    {item.content}
                    <span className="time">
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </span>
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
          className={`admin-dropdown${dropdownOpen ? " open" : ""}`}
          onClick={handleToggleDropdown}
          ref={dropdownRef}
        >
          <span className="admin-text">{adminName}</span>
          <FaChevronDown className="dropdown-icon" />

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={handleChangePasswordClick}
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangePassword();
                }}

              >
                <FaKey style={{ marginRight: 8 }} /> Đổi mật khẩu
              </div>
              <div
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <FaSignOutAlt style={{ marginRight: 8 }} /> Đăng xuất
              </div>
            </div>
          )}
        </div>
        {/* Modal đổi mật khẩu admin */}
        {showChangePasswordModal && (
          <div
            className="user-modal-overlay"
            onClick={() => setShowChangePasswordModal(false)}
          >
            <div
              className="user-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ minWidth: 400, maxWidth: 440 }}
            >
              <div
                className="modal-header"
                style={{
                  color: "#00c37e",
                  fontWeight: 700,
                  fontSize: 26,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                  borderBottom: "2px solid #eee",
                  paddingBottom: 8,
                }}
              >
                ĐỔI MẬT KHẨU ADMIN
              </div>
              <div
                className="modal-body"
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Mật khẩu hiện tại */}
                <div
                  className="modal-row"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 0 }}
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                      style={{
                        width: "100%",
                        height: 44,
                        fontSize: 16,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: 8,
                        top: 10,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowCurrentPassword((v) => !v)}
                    >
                      <EyeIcon isVisible={showCurrentPassword} />
                    </button>
                  </div>
                </div>
                {/* Mật khẩu mới */}
                <div
                  className="modal-row"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 0 }}
                  >
                    Mật khẩu mới
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      placeholder="Nhập mật khẩu mới"
                      style={{
                        width: "100%",
                        height: 44,
                        fontSize: 16,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: 8,
                        top: 10,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowNewPassword((v) => !v)}
                    >
                      <EyeIcon isVisible={showNewPassword} />
                    </button>
                  </div>
                </div>
                {/* Xác nhận mật khẩu mới */}
                <div
                  className="modal-row"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 0 }}
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      style={{
                        width: "100%",
                        height: 44,
                        fontSize: 16,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: 8,
                        top: 10,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      <EyeIcon isVisible={showConfirmPassword} />
                    </button>
                  </div>
                </div>
                {/* Quên mật khẩu */}
                <div className="forgot-password-link">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      navigate("/forgot-password");
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <div
                className="modal-footer"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 32,
                }}
              >
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  style={{
                    width: "50%",
                    height: 44,
                    borderRadius: 8,
                    border: "none",
                    background: "#f3f4f6",
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: "pointer",
                    color: "#222",
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn-save"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  style={{
                    width: "50%",
                    height: 44,
                    borderRadius: 8,
                    border: "none",
                    background: "#00c37e",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
