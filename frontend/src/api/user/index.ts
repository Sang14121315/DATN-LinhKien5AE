import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // Thay bằng URL backend của bạn khi triển khai
});

// Tự động thêm header Authorization nếu có token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi toàn cục
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;