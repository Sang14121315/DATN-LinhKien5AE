import React, { useEffect, useState } from "react";
import {
  fetchAllUsers,
  fetchUserById,
  User,
  blockUser,
} from "../../api/user/userAPI";
import "../../styles/pages/admin/userTable.scss";

const PAGE_SIZE = 10;

const AdminUserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = users;
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.phone && u.phone.includes(search))
      );
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, search, roleFilter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const handleView = async (id: string) => {
    const user = await fetchUserById(id);
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleBlock = async (id: string, isBlocked: boolean) => {
    await blockUser(id, !isBlocked);
    setModalOpen(false);
    setToast(!isBlocked ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!");
    // Cập nhật lại danh sách user
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="admin-user-page">
      <h2>Người dùng</h2>
      <div className="user-controls">
        <div className="filter-group">
          <button
            className={roleFilter === "all" ? "active" : ""}
            onClick={() => setRoleFilter("all")}
          >
            All
          </button>
          <button
            className={roleFilter === "admin" ? "active" : ""}
            onClick={() => setRoleFilter("admin")}
          >
            Admin
          </button>
          <button
            className={roleFilter === "user" ? "active" : ""}
            onClick={() => setRoleFilter("user")}
          >
            Người dùng
          </button>
        </div>
        <input
          className="user-search"
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên khách hàng</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Vai trò</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6}>Không có dữ liệu</td>
              </tr>
            ) : (
              paginatedUsers.map((user, idx) => (
                <tr key={user._id}>
                  <td>#{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address || "-"}</td>
                  <td>
                    <span
                      className={
                        user.role === "admin" ? "role-admin" : "role-user"
                      }
                    >
                      {user.role === "admin" ? "Admin" : "Người dùng"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleView(user._id)}
                    >
                      👁 Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div
        style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
      {modalOpen && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>THÔNG TIN TÀI KHOẢN</span>
              <span
                className={
                  selectedUser.role === "admin" ? "role-admin" : "role-user"
                }
              >
                {selectedUser.role === "admin" ? "Admin" : "Người dùng"}
              </span>
            </div>
            <div className="modal-body">
              <div className="modal-row">
                <b>Họ tên:</b>
                <span>{selectedUser.name}</span>
              </div>
              <div className="modal-row">
                <b>Email:</b>
                <span>{selectedUser.email}</span>
              </div>
              <div className="modal-row">
                <b>Địa chỉ:</b>
                <span>{selectedUser.address || "-"}</span>
              </div>
              <div className="modal-row">
                <b>Ngày tạo:</b>
                <span>
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="modal-row">
                <b>Trạng thái:</b>
                <span>
                  {selectedUser.isBlocked ? "Đã bị khóa" : "Hoạt động"}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)}>Quay lại</button>
              <button
                className="btn-block"
                onClick={() =>
                  handleBlock(selectedUser._id, !!selectedUser.isBlocked)
                }
              >
                {selectedUser.isBlocked ? "Mở khóa" : "Khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="user-toast-popup">{toast}</div>}
    </div>
  );
};

export default AdminUserPage;
