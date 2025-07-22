import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import '../../styles/pages/admin/contactTable.scss';

const API_BASE = 'http://localhost:5000/api';

interface Contact {
  _id: string;
  title: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'replied' | 'closed';
  reply?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied' | 'closed'>('all');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState<number>(5);
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!pendingDelete) return;
    setDeleteCountdown(5);
    setToast('Đã xóa liên hệ! Bạn có 5 giây để hoàn tác.');
    let seconds = 5;
    const interval = setInterval(() => {
      seconds--;
      setDeleteCountdown(seconds);
    }, 1000);
    const timeout = setTimeout(async () => {
      clearInterval(interval);
      try {
        await axios.delete(`${API_BASE}/contacts/${pendingDelete}`);
        setPendingDelete(null);
        setToast('Liên hệ đã bị xóa vĩnh viễn.');
        fetchContacts();
        setTimeout(() => setToast(null), 2000);
      } catch {
        setToast('Lỗi xóa liên hệ!');
        setPendingDelete(null);
      }
    }, 5000);
    setUndoTimeout(timeout);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingDelete]);

  // Reset trang về 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, contacts, pendingDelete]);

  const fetchContacts = async () => {
    setLoading(true);
    const res = await axios.get(`${API_BASE}/contacts`);
    setContacts(res.data);
    setLoading(false);
  };

  const visibleContacts = pendingDelete ? contacts.filter(c => c._id !== pendingDelete) : contacts;

  const filteredContacts = filter === 'all' ? visibleContacts : visibleContacts.filter(c => c.status === filter);
  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleView = (contact: Contact) => {
    setSelected(contact);
    setReply(contact.reply || '');
    setModalOpen(true);
  };

  const handleReply = async () => {
    if (!selected) return;
    await axios.post(`${API_BASE}/contacts/${selected._id}/reply`, { reply });
    setToast('Đã gửi phản hồi cho khách hàng!');
    setModalOpen(false);
    fetchContacts();
    setTimeout(() => setToast(null), 2000);
  };

  const handleClose = async () => {
    if (!selected) return;
    try {
      await axios.patch(`${API_BASE}/contacts/${selected._id}/status`, { status: 'closed' });
      setToast('Đã đóng liên hệ!');
      setModalOpen(false);
      fetchContacts();
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast('Lỗi: Không thể đóng liên hệ!');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleOpen = async () => {
    if (!selected) return;
    await axios.patch(`${API_BASE}/contacts/${selected._id}/open`);
    setToast('Đã mở lại liên hệ!');
    setModalOpen(false);
    fetchContacts();
    setTimeout(() => setToast(null), 2000);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setPendingDelete(selected._id);
    setModalOpen(false);
  };

  const handleUndoDelete = () => {
    if (undoTimeout) clearTimeout(undoTimeout);
    setPendingDelete(null);
    setToast('Đã hoàn tác xóa liên hệ!');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="admin-contact-page">
      <h2>Phản hồi liên hệ khách hàng</h2>
      <div className="contact-controls">
        <div className="filter-group">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tất cả</button>
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Chờ xử lý</button>
          <button className={filter === 'replied' ? 'active' : ''} onClick={() => setFilter('replied')}>Đã phản hồi</button>
          <button className={filter === 'closed' ? 'active' : ''} onClick={() => setFilter('closed')}>Đã đóng</button>
        </div>
      </div>
      <div className="contact-table-wrapper">
        <table className="contact-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Đang tải...</td></tr>
            ) : paginatedContacts.length === 0 ? (
              <tr><td colSpan={6}>Không có dữ liệu</td></tr>
            ) : (
              paginatedContacts.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.title}</td>
                  <td>
                    <span className={`status-badge ${c.status}`}>{
                      c.status === 'pending' ? 'Chờ xử lý' : c.status === 'replied' ? 'Đã phản hồi' : 'Đã đóng'
                    }</span>
                  </td>
                  <td>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                  <td>
                    <button className="btn-view" onClick={() => handleView(c)}>
                      <FaEye style={{ marginRight: 4, verticalAlign: 'middle' }} /> Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination" style={{ justifyContent: 'flex-end', display: 'flex', marginTop: 16 }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
            style={{ minWidth: 32, margin: '0 2px' }}
          >
            {i + 1}
          </button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
      </div>
      {modalOpen && selected && (
        <div className="contact-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Chi tiết liên hệ</span>
              <span className={`status-badge ${selected.status}`}>{
                selected.status === 'pending' ? 'Chờ xử lý' : selected.status === 'replied' ? 'Đã phản hồi' : 'Đã đóng'
              }</span>
            </div>
            <div className="modal-body">
              <div className="modal-row"><b>Họ tên:</b> {selected.name}</div>
              <div className="modal-row"><b>Email:</b> {selected.email}</div>
              <div className="modal-row"><b>SĐT:</b> {selected.phone}</div>
              <div className="modal-row"><b>Chủ đề:</b> {selected.title}</div>
              <div className="modal-row"><b>Nội dung:</b> {selected.message}</div>
              <div className="modal-row"><b>Ngày gửi:</b> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
              <div className="modal-row"><b>Phản hồi:</b></div>
              {selected.status === 'pending' ? (
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Nhập nội dung phản hồi..." />
              ) : (
                <div className="reply-content">{selected.reply || <i>Chưa có phản hồi</i>}</div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setModalOpen(false)}>Đóng</button>
              {selected.status === 'pending' && (
                <button className="btn-reply" onClick={handleReply} disabled={!reply.trim()}>Gửi phản hồi</button>
              )}
              {(selected.status === 'pending' || selected.status === 'replied') && (
                <button className="btn-close-contact" onClick={handleClose}>Đóng liên hệ</button>
              )}
              {selected.status === 'closed' && (
                <button className="btn-open-contact" onClick={handleOpen}>Mở lại liên hệ</button>
              )}
              <button className="btn-delete-contact" onClick={handleDelete}>Xóa liên hệ</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="contact-toast-popup">
          {pendingDelete
            ? `Đã xóa liên hệ! Bạn có ${deleteCountdown} giây để hoàn tác.`
            : toast}
          {pendingDelete && (
            <button className="btn-undo-delete" onClick={handleUndoDelete}>Hoàn tác</button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContactPage; 