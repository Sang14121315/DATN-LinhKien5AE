import axios from "../axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
  isBlocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name: string;
  phone?: string;
  address?: string;
}

// Lấy thông tin user hiện tại
export const getCurrentUser = async (): Promise<User> => {
  const response = await axios.get("/profile");
  return response.data;
};

// Cập nhật profile user
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await axios.put("/profile", data);
  return response.data;
};

// Interface cho đổi mật khẩu
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Đổi mật khẩu
export const changePassword = async (
  data: ChangePasswordData
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.put("/profile/change-password", data);
  return response.data;
};

// Đăng ký
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) => {
  const response = await axios.post("/register", data);
  return response.data;
};

// Đăng nhập
export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post("/login", data);
  return response.data;
};

// Quên mật khẩu
export const forgotPassword = async (data: { email: string }) => {
  const response = await axios.post("/forgot-password", data);
  return response.data;
};

// Gửi OTP quên mật khẩu
export const sendForgotPasswordOTP = async (data: { email: string }) => {
  const response = await axios.post("/forgot-password/send-otp", data);
  return response.data;
};

// Đặt lại mật khẩu với OTP
export const resetPasswordWithOTP = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await axios.post("/forgot-password/reset-with-otp", data);
  return response.data;
};

// Đặt lại mật khẩu với OTP
export const resetPassword = async (data: {
  token: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await axios.post("/reset-password", data);
  return response.data;
};

// Admin functions
// Lấy tất cả users (admin)
export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await axios.get("/users");
  return response.data;
};

// Lấy user theo ID (admin)
export const fetchUserById = async (userId: string): Promise<User> => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};

// Cập nhật user (admin)
export const updateUser = async (
  userId: string,
  updatedData: Partial<Omit<User, "_id" | "created_at" | "updated_at" | "role">>
): Promise<User> => {
  const response = await axios.put(`/users/${userId}`, updatedData);
  return response.data;
};

// Xóa user (admin)
export const deleteUser = async (
  userId: string
): Promise<{ message: string }> => {
  const response = await axios.delete(`/users/${userId}`);
  return response.data;
};

// Khóa/mở khóa user (admin)
export const blockUser = async (
  userId: string,
  block: boolean
): Promise<User> => {
  const response = await axios.patch(`/users/${userId}/block`, { block });
  return response.data;
};

// Loyalty (Khách hàng thân thiết)
export interface LoyaltyInfo {
  loyaltyPoints: number;
  totalSpent: number;
  memberLevel: string;
}

export interface LoyaltyTransaction {
  _id: string;
  user_id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  created_at: string;
}

export const getLoyaltyInfo = async (): Promise<LoyaltyInfo> => {
  const response = await axios.get('/loyalty/info');
  return response.data;
};

export const getLoyaltyHistory = async (): Promise<LoyaltyTransaction[]> => {
  const response = await axios.get('/loyalty/history');
  return response.data;
};

export const redeemLoyaltyPoints = async (points: number, description?: string): Promise<{ success: boolean; message: string; currentPoints: number }> => {
  const response = await axios.post('/loyalty/redeem', { points, description });
  return response.data;
};

// Reward (Ưu đãi/quà tặng)
export interface Reward {
  _id: string;
  name: string;
  pointsRequired: number;
  description?: string;
  type: string;
  quantity: number;
  image?: string;
  isActive: boolean;
}

export const getRewardList = async (): Promise<Reward[]> => {
  const response = await axios.get('/rewards');
  return response.data;
};

export const redeemReward = async (rewardId: string): Promise<{ success: boolean; message: string; currentPoints: number }> => {
  const response = await axios.post('/rewards/redeem', { rewardId });
  return response.data;
};

export interface Coupon {
  _id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  pointsRequired: number;
  description?: string;
  image?: string;
  limitMonth?: number; // Số lượt đổi tối đa/tháng
}

// Lấy số lượt user đã đổi 1 coupon trong tháng hiện tại
export const getUserCouponCountInMonth = async (couponId: string): Promise<number> => {
  const response = await axios.get(`/coupons/user-count-in-month/${couponId}`);
  return response.data.count;
};

export const getCouponList = async (): Promise<Coupon[]> => {
  const response = await axios.get('/coupons?is_active=true');
  return response.data;
};

export const redeemCoupon = async (couponId: string): Promise<{ success: boolean; message: string; currentPoints: number }> => {
  const response = await axios.post('/coupons/redeem', { couponId });
  return response.data;
};

// Lấy danh sách voucher user đã đổi (chưa dùng)
export const getMyCoupons = async (): Promise<Coupon[]> => {
  const response = await axios.get('/my-coupons');
  return response.data;
};