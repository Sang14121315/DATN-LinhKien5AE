import React from "react";
import { ToastContainer } from "react-toastify";
import MainRouter from "./router/index.router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { FavoriteProvider } from "./context/FavoriteContext";

const App: React.FC = () => {
  return (
    <FavoriteProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <MainRouter />
            <ToastContainer position="top-right" autoClose={3000} />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </FavoriteProvider>
  );
};

export default App;