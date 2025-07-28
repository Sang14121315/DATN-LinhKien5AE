import React, { useState, useEffect } from "react";
import { getCurrentUser, updateProfile, User } from "@/api/user/userAPI";
import "@/styles/pages/user/profile.scss";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address || ""
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="content-header">
        <h1>Hồ Sơ Của Tôi</h1>
        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <div className="profile-form-container">
        {/* Left Column - Form */}
        <div className="form-column">
          {loading ? (
            <div className="loading">Đang tải thông tin...</div>
          ) : (
            <>
              <div className="form-group">
                <label>Email</label>
                <div className="email-display">
                  <span>{user?.email || ""}</span>
                  <small>Email không thể thay đổi</small>
                </div>
              </div>

              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ của bạn"
                  rows={3}
                />
              </div>

              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 