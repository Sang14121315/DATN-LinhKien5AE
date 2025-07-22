import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/admin/Sidebar";
import "@/styles/layouts/admin.layout.scss";
import Footer from "@/components/admin/Footer";
import Header from "@/components/admin/Header";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      user = null;
    }
    if (!user || user.role !== "admin") {
      navigate("/login"); // hoặc navigate("/") nếu muốn về trang chủ
    }
  }, [navigate]);

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-content">
        <Header/>
        <Outlet />
         <Footer/>
      </main>
    </div>
  );
};

export default AdminLayout;