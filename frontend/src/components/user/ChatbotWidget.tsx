import React, { useEffect, useRef, useState } from "react";
import { fetchConversation, sendMessage, Message } from "../../api/user/messageAPI";
import "@/styles/components/user/ChatbotWidget.scss";
import { User } from "../../api/user/userAPI";
import { io, Socket } from 'socket.io-client';
import Logo from '../../assets/Logo.png';
// XÓA: import { Product } from "../../types/Product";


// XÓA HÀM getCurrentUser, checkForAdminReplies, generateBotReply, handleOpenProductModal, các biến e, error không dùng
// SỬA lỗi typescript ở products.map

const SOCKET_URL = 'http://localhost:5000';

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Lấy user từ localStorage chỉ 1 lần khi mount
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    setCurrentUser(userStr ? JSON.parse(userStr) : null);
  }, []);
  // XÓA: const [showProductModal, setShowProductModal] = useState(false);
  const socketRef = useRef<Socket | null>(null);


  // Tải lịch sử hội thoại
  useEffect(() => {
    if (open && currentUser) {
      // Lấy đúng hội thoại giữa user và admin (không truyền 'admin' mà truyền id admin hoặc id đối phương)
      // Giả sử backend đã trả về đúng hội thoại giữa user và admin khi truyền receiver_id là 'admin'
      fetchConversation('admin').then((msgs) => {
        console.log('Tin nhắn lấy từ backend:', msgs);
        setMessages(msgs);
      });
    }
  }, [open, currentUser]);

  // Kết nối socket khi mở chat
  useEffect(() => {
    if (open && currentUser) {
      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socket.emit('join', currentUser._id);
      socketRef.current = socket;
      socket.on('new-message', (msg: Message) => {
        console.log('[USER] Nhận socket new-message:', msg);
        const isDuplicate = msg._id
          ? messages.some(m => m._id === msg._id)
          : messages.some(m => m.created_at === msg.created_at && m.content === msg.content);
        if (isDuplicate) {
          console.log('[USER] Tin nhắn bị trùng, bỏ qua');
          return;
        }
        setMessages(prev => {
          const updated = [...prev, msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          console.log('[USER] Cập nhật messages:', updated);
          return updated;
        });
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-message');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [open, currentUser, messages]); // Added messages to dependency array

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Khi gửi tin nhắn, phát sự kiện qua socket
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      console.log('[USER] Gửi tin nhắn:', { sender_id: currentUser?._id || 'user', receiver_id: 'admin', content: input });
      await sendMessage('admin', input);
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          sender_id: currentUser?._id || 'user',
          receiver_id: 'admin',
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
  // Khi gửi sản phẩm, cũng gửi qua socket
  // XÓA: const handleSendProduct = async (product: Product) => {
  // XÓA:   setShowProductModal(false);
  // XÓA:   setLoading(true);
  // XÓA:   try {
  // XÓA:     const productMsg: Message = {
  // XÓA:       sender_id: currentUser?._id || 'user',
  // XÓA:       receiver_id: 'admin',
  // XÓA:       content: JSON.stringify({ type: 'product', productId: product._id }),
  // XÓA:       created_at: new Date().toISOString(),
  // XÓA:     };
  // XÓA:     setInput("");
  // XÓA:     await sendMessage('admin', productMsg.content);
  // XÓA:     if (socketRef.current) {
  // XÓA:       socketRef.current.emit('send-message', productMsg);
  // XÓA:     }
  // XÓA:   } finally {
  // XÓA:     setLoading(false);
  // XÓA:   }
  // XÓA: };

  // Hàm render tin nhắn (text hoặc sản phẩm)
  const renderMessageContent = (m: Message) => m.content;

  // Hàm định dạng thời gian gửi tin nhắn
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
  };

  // Quay lại logic render và style như trước khi hỏi 'theo bạn nên hiện theo nào'
  // (render lại như logic cũ, không thêm class user-message/admin-message, không filter mới)

  return (
    <div className="chatbot-widget user">
      {!open && (
        <div className="chat-button" onClick={() => { setOpen(true); }}>
          <img src={Logo} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: '50%' }} />
        </div>
      )}
      {open && (
        <div className="chat-container">
          <div className="chat-header">
            <span>5AE</span>
            <button className="close-button" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="chat-messages" style={{ display: 'flex', height: 400 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                {messages.length > 0 ? (
                  messages.map((m, i) => {
                    // Không filter gì cả, chỉ xác định ai là user để style
                    const senderId = typeof m.sender_id === 'string' ? m.sender_id : m.sender_id?._id;
                    const isUser = String(senderId) === String(currentUser?._id);
                    return (
                      <div
                        key={i}
                        className={`message ${isUser ? "user" : "bot"}`}
                        style={{ marginBottom: 4 }}
                      >
                        {isUser ? (
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
            </div>
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
              <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
                Gửi
              </button>
            </div>
          </div>
          {/* Modal chọn sản phẩm */}
          {/* XÓA: {showProductModal && (
            <div className="product-modal-bg" onClick={() => setShowProductModal(false)}>
              <div className="product-modal" onClick={e => e.stopPropagation()}>
                <h4>Chọn sản phẩm gửi vào chat</h4>
                <div className="product-list-modal">
                  {products.length === 0 && <div>Đang tải sản phẩm...</div>}
                  {products.map((product: Product) => (
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
          )} */}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;