import React, { useState } from "react";
import { FaSearch, FaClipboard } from "react-icons/fa";
import "@/styles/pages/user/purchase.scss";

const PurchasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending-payment", label: "Chờ thanh toán" },
    { id: "shipping", label: "Vận chuyển" },
    { id: "pending-delivery", label: "Chờ giao hàng" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
    { id: "return-refund", label: "Trả hàng/Hoàn tiền" }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý tìm kiếm
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="purchase-page">
      <div className="purchase-container">
        {/* Top Navigation Tabs */}
        <div className="purchase-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Main Content - Empty State */}
        <div className="purchase-content">
          <div className="empty-state">
            <div className="empty-icon">
              <FaClipboard />
            </div>
            <div className="empty-text">
              Chưa có đơn hàng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage; 