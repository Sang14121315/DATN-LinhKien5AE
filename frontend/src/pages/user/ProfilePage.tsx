import React, { useState, useEffect } from "react";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  User,
  ChangePasswordData,
  getLoyaltyInfo,
  getLoyaltyHistory,
  redeemLoyaltyPoints,
  LoyaltyInfo,
  LoyaltyTransaction,
  getRewardList,
  redeemReward,
  Reward,
} from "@/api/user/userAPI";
import "@/styles/pages/user/profile.scss";

// Icon con mắt để ẩn/hiện mật khẩu
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

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // State cho đổi mật khẩu
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // State cho ẩn/hiện mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State cho thông tin khách hàng thân thiết
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransaction[]>([]);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemDesc, setRedeemDesc] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // State cho ưu đãi/quà tặng
  const [rewardList, setRewardList] = useState<Reward[]>([]);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchLoyalty();
    fetchRewards();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyalty = async () => {
    try {
      const info = await getLoyaltyInfo();
      setLoyaltyInfo(info);
      const history = await getLoyaltyHistory();
      setLoyaltyHistory(history);
    } catch (e) {
      console.error('Lỗi lấy thông tin khách hàng thân thiết:', e);
    }
  };

  const fetchRewards = async () => {
    try {
      const rewards = await getRewardList();
      setRewardList(rewards);
    } catch (e) {
      console.error('Lỗi lấy danh sách ưu đãi/quà tặng:', e);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    setRedeemingRewardId(rewardId);
    try {
      const res = await redeemReward(rewardId);
      alert(res.message);
      fetchLoyalty();
      fetchRewards();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi đổi điểm lấy ưu đãi!');
    } finally {
      setRedeemingRewardId(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  // Xử lý đổi mật khẩu
  const handlePasswordChange = (
    field: keyof ChangePasswordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    // Validation
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
      const result = await changePassword(passwordData);

      if (result.success) {
        alert(result.message);
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
        });
        setConfirmPassword("");
      } else {
        alert(result.message || "Có lỗi xảy ra khi đổi mật khẩu!");
      }
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi đổi mật khẩu!";
      alert(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  // Xử lý quy đổi điểm
  const handleRedeem = async () => {
    if (!redeemPoints || isNaN(Number(redeemPoints)) || Number(redeemPoints) <= 0) {
      alert('Vui lòng nhập số điểm hợp lệ!');
      return;
    }
    setRedeeming(true);
    try {
      const res = await redeemLoyaltyPoints(Number(redeemPoints), redeemDesc);
      alert(res.message);
      setRedeemPoints('');
      setRedeemDesc('');
      fetchLoyalty();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Lỗi quy đổi điểm!');
    } finally {
      setRedeeming(false);
    }
  };

  // Toggle ẩn/hiện mật khẩu
  const togglePasswordVisibility = (field: string) => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
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
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
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

      {/* Phần đổi mật khẩu */}
      <div className="change-password-section">
        <div className="section-header">
          <h2>Đổi Mật Khẩu</h2>
        </div>

        <div className="password-form">
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <div className="password-input-container">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("current")}
              >
                <EyeIcon isVisible={showCurrentPassword} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>
            <div className="password-input-container">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("new")}
              >
                <EyeIcon isVisible={showNewPassword} />
              </button>
            </div>
            <small>
              Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và
              số
            </small>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                <EyeIcon isVisible={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button
            className="change-password-btn"
            onClick={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>

          {/* Phần quên mật khẩu nằm bên trong form đổi mật khẩu */}
          <div className="forgot-password-link">
            <span>Quên mật khẩu? </span>
            <a href="/forgot-password" className="forgot-password-link-text">
              Đặt lại mật khẩu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
