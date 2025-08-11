import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias @ trỏ đến thư mục src
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Cổng backend (thay nếu khác, ví dụ: 3000)
        changeOrigin: true,
        secure: false, // Thêm nếu backend không dùng HTTPS (dev mode)
        // Bỏ rewrite nếu backend mong đợi /api prefix (ví dụ: endpoint full là /api/favorite/add)
        // Nếu backend không có /api base, uncomment dòng dưới:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});