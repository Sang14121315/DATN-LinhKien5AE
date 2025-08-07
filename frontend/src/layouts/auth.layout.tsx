import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import ChatbotWidget from "@/components/user/ChatbotWidget";

const AuthLayout: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default AuthLayout;
