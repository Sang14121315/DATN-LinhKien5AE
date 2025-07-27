import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaFileAlt } from "react-icons/fa";
import { getCurrentUser, User } from "@/api/user/userAPI";
import { useState, useEffect } from "react";
import "@/styles/layouts/userProfile.layout.scss";

const UserProfileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const navigationItems = [
    {
      id: "profile",
      label: "Hồ Sơ",
      icon: FaUser,
      path: "/profile"
    },
    {
      id: "purchases",
      label: "Đơn Mua",
      icon: FaFileAlt,
      path: "/purchase"
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="user-profile-layout">
      <div className="profile-container">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          {/* User Info */}
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || "Loading..."}</div>
              <div className="edit-profile">
                <FaUser />
                Sửa Hồ Sơ
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="navigation-section">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout; 