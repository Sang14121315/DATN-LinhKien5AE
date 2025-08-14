import React, { useEffect, useRef, useState } from "react";
import { sendMessage, Message, fetchConversation } from "@/api/user/messageAPI";
import { io, Socket } from 'socket.io-client';
import "@/styles/components/user/ChatbotWidget.scss";
import { fetchUserById } from '@/api/userAPI';
import Logo from '@/assets/Logo.png';
import { Product, fetchAllProducts } from "@/api/user/productAPI";

const SOCKET_URL = 'http://localhost:5000';
const getCurrentUser = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};
const currentUser = getCurrentUser();
const adminId = currentUser?._id;

// Thêm hàm formatTimeAgo
function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now.getTime() - date.getTime()) / 1000; // giây
  if (diff < 60) return `${Math.floor(diff)} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  // Nếu lâu hơn 1 tháng, hiện ngày/tháng/năm
  return date.toLocaleDateString('vi-VN');
}

const AdminChatboxWidget: React.FC = () => {
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  // 2. Thêm state lưu số tin nhắn chưa đọc cho từng user
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);

  // Khi chọn user hoặc mở chat, luôn fetch lại hội thoại
  useEffect(() => {
    if (open && selectedUser) {
      fetchConversation(selectedUser).then((msgs) => {
        setConversations(prev => ({
          ...prev,
          [selectedUser]: msgs
        }));
      });
    }
  }, [open, selectedUser]);

  // Kết nối socket - chỉ tạo 1 lần khi open, cleanup đúng cách
  useEffect(() => {
    if (open) {
      if (!socketRef.current) {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socket.emit('join', adminId);
        socketRef.current = socket;
        socket.on('new-message', (msg: Message) => {
          let userId;
          if (msg.sender_id === adminId && msg.receiver_id === adminId) {
            userId = adminId;
          } else {
            userId = msg.sender_id === adminId ? msg.receiver_id : msg.sender_id;
          }
          setConversations(prev => {
            const exists = (prev[userId] || []).some(m => m._id === msg._id);
            if (exists) return prev;
            const updated = {
              ...prev,
              [userId]: [...(prev[userId] || []), msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            };
            return updated;
          });
          if (userId !== selectedUser) {
            setUnreadCounts(prev => ({
              ...prev,
              [userId]: (prev[userId] || 0) + 1
            }));
          }
        });
      }
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-message');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [open]);

  // Xóa setOpen(true) trong useEffect lấy userId từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('admin_selected_user');
    if (savedUser) {
      setSelectedUser(savedUser);
    }
  }, []);

  // Scroll xuống khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, open, selectedUser]);

  // Sắp xếp tin nhắn theo thời gian
  Object.keys(conversations).forEach(key => {
    conversations[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  // Fetch tên user cho tất cả senderId trong mọi hội thoại
  useEffect(() => {
    // Lấy tất cả senderId từ mọi tin nhắn trong mọi hội thoại
    const allSenderIds = new Set<string>();
    Object.values(conversations).forEach(msgs => {
      msgs.forEach(m => {
        const senderId = typeof m.sender_id === 'string' ? m.sender_id : m.sender_id?._id;
        allSenderIds.add(senderId);
      });
    });

    allSenderIds.forEach(async (senderId) => {
      if (!userNames[senderId]) {
        try {
          const user = await fetchUserById(senderId);
          setUserNames(prev => ({
            ...prev,
            [senderId]: String(user && typeof user === 'object' ? (user.name || user.email || senderId) : user)
          }));
        } catch {
          setUserNames(prev => ({ ...prev, [senderId]: String(senderId) }));
        }
      }
    });
  }, [conversations, userNames]);

  // Danh sách user có hội thoại (không lọc, luôn hiện tất cả user)
  const allUsersWithConversation = Object.keys(conversations);

  // Lọc đúng hội thoại giữa admin và user đang chọn (so sánh _id trong object hoặc string)
  const filteredMessages = (msgs: Message[]) => {
    if (!selectedUser) return [];
    return msgs.filter(m => {
      const senderId = typeof m.sender_id === 'string' ? m.sender_id : m.sender_id?._id;
      const receiverId = typeof m.receiver_id === 'string' ? m.receiver_id : m.receiver_id?._id;
      return (
        // admin gửi cho chính mình
        (senderId === adminId && receiverId === adminId) ||
        // admin với user
        (senderId === adminId && receiverId === selectedUser) ||
        (senderId === selectedUser && receiverId === adminId)
      );
    });
  };

  // ĐÃ KHÔI PHỤC: Xóa toàn bộ logic countUnansweredMessages, usersWithUnanswered, unansweredMessages...
  // Trả lại logic hiển thị badge và danh sách user/chat như mặc định ban đầu (có thể là đếm tổng số tin nhắn hoặc logic cũ của bạn)
  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return;
    setLoading(true);
    try {
      await sendMessage(selectedUser, input);
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          sender_id: adminId,
          receiver_id: selectedUser,
          content: input,
          created_at: new Date().toISOString(),
        });
      }
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách sản phẩm khi mở modal
  // Xoá hàm handleOpenProductModal
  // Gửi sản phẩm vào chat
  const handleSendProduct = async (product: Product) => {
    setShowProductModal(false);
    setLoading(true);
    try {
      const productMsg: Message = {
        sender_id: adminId,
        receiver_id: selectedUser,
        content: JSON.stringify({ type: 'product', productId: product._id }),
        created_at: new Date().toISOString(),
      };
      setInput("");
      await sendMessage(selectedUser, productMsg.content);
      if (socketRef.current) {
        socketRef.current.emit('send-message', productMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm lại logic lấy sản phẩm khi mở modal
  const handleOpenProductModal = async () => {
    setShowProductModal(true);
    if (products.length === 0) {
      // Giả sử có hàm fetchAllProducts
      const res = await fetchAllProducts();
      setProducts(res);
    }
  };

  // Render nội dung tin nhắn
  const renderMessageContent = (m: Message) => {
    try {
      const data = JSON.parse(m.content);
      if (data.type === "product" && data.productId) {
        const product = products.find((p) => p._id === data.productId);
        if (product) {
          return (
            <div className="chat-product-msg">
              <img src={product.img_url} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ marginLeft: 8 }}>
                <div style={{ fontWeight: 600 }}>{product.name}</div>
                <div style={{ color: '#e53935', fontWeight: 700 }}>{product.price.toLocaleString()}₫</div>
                <a href={`/product/${product._id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontSize: 13 }}>Xem chi tiết</a>
              </div>
            </div>
          );
        }
      }
    } catch {
      // Không phải JSON, render text bình thường
    }
    return m.content;
  };

  return (
    <div className="chatbot-widget admin" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {!open && (
        <div className="chat-button" onClick={() => setOpen(true)}>
          <img src={Logo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '50%' }} />
        </div>
      )}
      {open && (
        <div className="chat-container">
          <div className="chat-header">
            <span>Admin Chat</span>
            <button className="close-button" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-messages" style={{ display: 'flex', height: 400 }}>
            {/* Danh sách hội thoại */}
            <div style={{ width: 220, borderRight: '1px solid #eee', overflowY: 'auto' }}>
              {/* Bỏ chữ Khách hàng */}
              {allUsersWithConversation.length === 0 && <div style={{ padding: 8 }}>Chưa có hội thoại</div>}
              {allUsersWithConversation.map(userId => {
                const msgs = conversations[userId];
                const lastMsg = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
                let displayName = userNames[userId];
                if (!displayName) {
                  displayName = 'Đang tải...';
                }
                // Xoá biến unreadCount trong map user
                return (
                  <div
                    key={userId}
                    className={`conversation-item${selectedUser === userId ? ' active' : ''}`}
                    onClick={() => handleSelectUser(userId)}
                  >
                    <div className="conversation-header-row">
                      <span className="conversation-username">{displayName}</span>
                      <span className="conversation-time">{lastMsg ? formatTimeAgo(lastMsg.created_at) : ""}</span>
                    </div>
                    <div className="conversation-content-row">
                      <span className="conversation-lastmsg">{lastMsg ? lastMsg.content : ""}</span>
                      {unreadCounts[userId] > 0 && (
                        <span className="unread-badge">{unreadCounts[userId]}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Phần chi tiết hội thoại hoặc thông báo chọn user */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {selectedUser ? (
                <>
                  <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                    {/* Trước khi render messages */}
                    {filteredMessages(conversations[selectedUser] || []).length > 0 ? (
                      filteredMessages(conversations[selectedUser] || []).map((m, i) => {
                        const senderId = typeof m.sender_id === 'string' ? m.sender_id : m.sender_id?._id;
                        const isAdmin = String(senderId) === String(adminId);
                        return (
                          <div
                            key={i}
                            className={`message ${isAdmin ? "user" : "bot"}`}
                            style={{ marginBottom: 4 }}
                          >
                            {isAdmin ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span className="message-bubble user-message">{renderMessageContent(m)}</span>
                                <span className="message-time">{formatTimeAgo(m.created_at)}</span>
                              </div>
                            ) : (
                              <div className="bot-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span className="message-bubble bot-bubble">{renderMessageContent(m)}</span>
                                <span className="message-time">{formatTimeAgo(m.created_at)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: '#888', fontSize: 15, textAlign: 'center', marginTop: 24 }}>
                        Chưa có tin nhắn nào trong hội thoại này.
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="chat-input">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        disabled={loading}
                      />
                      <button onClick={handleSend} disabled={loading || !input.trim()}>
                        Gửi
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 16 }}>
                  Chọn một hội thoại để bắt đầu chat
                </div>
              )}
            </div>
          </div>
          {/* Modal chọn sản phẩm */}
          {showProductModal && (
            <div className="product-modal-bg" onClick={() => setShowProductModal(false)}>
              <div className="product-modal" onClick={e => e.stopPropagation()}>
                <h4>Chọn sản phẩm gửi vào chat</h4>
                <div className="product-list-modal">
                  {products.length === 0 && <div>Đang tải sản phẩm...</div>}
                  {products.map((product) => (
                    <div key={product._id} className="product-modal-item" onClick={() => handleSendProduct(product)}>
                      <img src={product.img_url} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ color: '#e53935', fontWeight: 700 }}>{product.price.toLocaleString()}₫</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowProductModal(false)} style={{ marginTop: 12 }}>Đóng</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminChatboxWidget;
