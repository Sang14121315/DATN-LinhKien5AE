import React, { useEffect, useState } from "react";
import { fetchAllMessages, sendMessage, Message } from "@/api/user/messageAPI";
import "@/styles/pages/admin/messageManagement.scss";

const MessageManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const reply: Message = {
        sender_id: "admin",
        receiver_id: selectedConversation,
        content: replyText,
        created_at: new Date().toISOString(),
      };

      await sendMessage(selectedConversation, replyText);
      setMessages(prev => [...prev, reply]);
      setReplyText("");
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
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
                  <div className="message-content">{msg.content}</div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement; 