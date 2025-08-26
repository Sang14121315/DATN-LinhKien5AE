import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";

const AuthLayout: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
