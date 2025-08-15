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
