import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/admin/Sidebar";
import "@/styles/layouts/admin.layout.scss";
import Footer from "@/components/admin/Footer";
import Header from "@/components/admin/Header";
// removed AdminChatboxWidget

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-content">
        <Header/>
        <Outlet />
         <Footer/>
      </main>
      {/* chatbox removed */}
    </div>
  );
};

export default AdminLayout;