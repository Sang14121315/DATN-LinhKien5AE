import React from "react";
import { ToastContainer } from "react-toastify";
import MainRouter from "./router/index.router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { FavoriteProvider } from "./context/FavoriteContext";

const App: React.FC = () => {
  return (
    <AuthProvider> {/* Di chuyển AuthProvider ra ngoài cùng vì FavoriteProvider có thể phụ thuộc vào user từ AuthContext */}
      <FavoriteProvider>
        <CartProvider>
          <OrderProvider>
            <MainRouter />
            <ToastContainer position="top-right" autoClose={3000} />
          </OrderProvider>
        </CartProvider>
      </FavoriteProvider>
    </AuthProvider>
  );
};

export default App;