import React, { useEffect, useState } from "react";
import { fetchAllMessages, sendMessage, Message } from "@/api/user/messageAPI";
import { fetchAllProducts, Product } from "@/api/user/productAPI";
import "@/styles/pages/admin/messageManagement.scss";
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Đổi nếu backend chạy ở host khác

const MessageManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const socketRef = React.useRef<Socket | null>(null);

  // Lấy tất cả tin nhắn
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const allMessages = await fetchAllMessages();
        setMessages(allMessages);
      } catch (error) {
        console.error("Lỗi tải tin nhắn:", error);
      }
    };
    loadMessages();
  }, []);

  // Kết nối socket khi vào trang admin
  useEffect(() => {
    // Giả sử admin có id là 'admin'
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('join', 'admin');
    socketRef.current = socket;
    // Lắng nghe tin nhắn mới
    socket.on('new-message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Lấy danh sách sản phẩm khi mở modal
  const handleOpenProductModal = async () => {
    setShowProductModal(true);
    if (products.length === 0) {
      try {
        const res = await fetchAllProducts();
        setProducts(res);
      } catch (e) {
        setProducts([]);
      }
    }
  };
  // Gửi sản phẩm vào chat
  const handleSendProduct = async (product: Product) => {
    setShowProductModal(false);
    setLoading(true);
    try {
      const productMsg: Message = {
        sender_id: "admin",
        receiver_id: selectedConversation,
        content: JSON.stringify({ type: "product", productId: product._id }),
        created_at: new Date().toISOString(),
      };
      await sendMessage(selectedConversation, productMsg.content);
      setMessages(prev => [...prev, productMsg]);
      setReplyText("");
      if (socketRef.current) {
        socketRef.current.emit('send-message', productMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Nhóm tin nhắn theo conversation
  const conversations = messages.reduce((acc, msg) => {
    const conversationId = msg.sender_id === "admin" ? msg.receiver_id : msg.sender_id;
    if (!acc[conversationId]) {
      acc[conversationId] = [];
    }
    acc[conversationId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  // Sắp xếp tin nhắn theo thời gian
  Object.keys(conversations).forEach(key => {
    conversations[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  // Khi gửi tin nhắn, phát sự kiện qua socket
  const handleReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    setLoading(true);
    try {
      const reply: Message = {
        sender_id: 'admin',
        receiver_id: selectedConversation,
        content: replyText,
        created_at: new Date().toISOString(),
      };
      await sendMessage(selectedConversation, replyText);
      setMessages(prev => [...prev, reply]);
      setReplyText("");
      if (socketRef.current) {
        socketRef.current.emit('send-message', reply);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Hàm render tin nhắn (text hoặc sản phẩm)
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
    <div className="message-management">
      <h2>Quản lý tin nhắn</h2>
      
      <div className="message-layout">
        {/* Danh sách conversation */}
        <div className="conversation-list">
          <h3>Danh sách hội thoại</h3>
          {Object.keys(conversations).map(conversationId => (
            <div
              key={conversationId}
              className={`conversation-item ${selectedConversation === conversationId ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conversationId)}
            >
              <div className="user-id">User: {conversationId}</div>
              <div className="last-message">
                {conversations[conversationId][conversations[conversationId].length - 1]?.content}
              </div>
              <div className="message-count">
                {conversations[conversationId].length} tin nhắn
              </div>
            </div>
          ))}
        </div>

        {/* Chi tiết conversation */}
        {selectedConversation && (
          <div className="conversation-detail">
            <h3>Hội thoại với: {selectedConversation}</h3>
            
            <div className="messages-container">
              {conversations[selectedConversation].map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender_id === 'admin' ? 'admin' : 'user'}`}
                >
                  <div className="message-content">{renderMessageContent(msg)}</div>
                  <div className="message-time">{formatDate(msg.created_at)}</div>
                </div>
              ))}
            </div>

            {/* Form trả lời */}
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập tin nhắn trả lời..."
                rows={3}
              />
              <button
                onClick={handleReply}
                disabled={loading || !replyText.trim()}
              >
                {loading ? 'Đang gửi...' : 'Gửi trả lời'}
              </button>
              <button
                onClick={handleOpenProductModal}
                disabled={loading}
                style={{ marginLeft: 8 }}
              >
                Gửi sản phẩm
              </button>
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
    </div>
  );
};

export default MessageManagement; 