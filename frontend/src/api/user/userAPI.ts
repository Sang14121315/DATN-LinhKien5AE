import axiosInstance from '../axios'; // đường dẫn tới file axios.ts


// Định nghĩa kiểu dữ liệu User
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

// -------------------------
// API: Đăng ký người dùng
// -------------------------
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}): Promise<User> => {
  const response = await axiosInstance.post(`/register`, userData);
  return response.data;
};

// -------------------------
// API: Đăng nhập
// -------------------------
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  const response = await axiosInstance.post(`/login`, credentials);
  return response.data;
};

// -------------------------
// API: Quên mật khẩu
// -------------------------
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/forgot-password`, { email });
  return response.data;
};

// -------------------------
// API: Đặt lại mật khẩu
// -------------------------
export const resetPassword = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
};

// -------------------------
// API: Lấy tất cả người dùng (admin)
// -------------------------
export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get(`/users`);
  return response.data;
};

// -------------------------
// API: Lấy chi tiết người dùng theo ID
// -------------------------
export const fetchUserById = async (userId: string): Promise<User> => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

// -------------------------
// API: Cập nhật người dùng
// -------------------------
export const updateUser = async (
  userId: string,
  updatedData: Partial<Omit<User, '_id' | 'created_at' | 'updated_at' | 'role'>>
): Promise<User> => {
  const response = await axiosInstance.put(`/users/${userId}`, updatedData);
  return response.data;
};

// -------------------------
// API: Xóa người dùng
// -------------------------
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};
