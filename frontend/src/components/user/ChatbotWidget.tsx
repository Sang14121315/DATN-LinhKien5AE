import React, { useEffect, useRef, useState } from "react";
import { fetchConversation, sendMessage, Message } from "../../api/user/messageAPI";
import "@/styles/components/user/ChatbotWidget.scss";
import { User } from "../../api/user/userAPI";


// Lấy người dùng hiện tại từ localStorage
const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

const adminId = "admin"; // ID người quản trị (chatbot)

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();

  // Tải lịch sử hội thoại
  useEffect(() => {
    if (open && currentUser) {
      setLoading(true);
      fetchConversation(adminId)
        .then(setMessages)
        .finally(() => setLoading(false));
    }
  }, [open, currentUser]);

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      // Tạo tin nhắn người dùng
      const userMsg: Message = {
        sender_id: currentUser?._id || "anonymous",
        receiver_id: adminId,
        content: input,
        created_at: new Date().toISOString(),
      };
      
      // Hiển thị tin nhắn ngay lập tức
      setMessages((prev) => [...prev, userMsg]);
      const currentInput = input;
      setInput("");

      // Gửi tin nhắn thực sự qua API
      try {
        const savedMsg = await sendMessage(adminId, currentInput);
        console.log("Tin nhắn đã được gửi:", savedMsg);
        
        // Có thể thêm logic để poll tin nhắn mới từ admin
        // setTimeout(() => checkForAdminReplies(), 3000);
        
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        // Hiển thị thông báo lỗi cho user
        const errorMsg: Message = {
          sender_id: adminId,
          receiver_id: currentUser?._id || "anonymous",
          content: "Xin lỗi, có vấn đề với kết nối. Vui lòng thử lại sau hoặc liên hệ trực tiếp.",
          created_at: new Date().toISOString(),
        };
        setTimeout(() => {
          setMessages((prev) => [...prev, errorMsg]);
        }, 1000);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra tin nhắn mới từ admin (có thể implement sau)
  const checkForAdminReplies = async () => {
    try {
      const conversation = await fetchConversation(adminId);
      const newMessages = conversation.filter(msg => 
        msg.sender_id === adminId && 
        !messages.some(existing => existing._id === msg._id)
      );
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.log("Không thể kiểm tra tin nhắn mới");
    }
  };

  // Hàm tạo phản hồi giả lập
  const generateBotReply = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes("giá") || msg.includes("bao nhiêu")) {
      return "Bạn đang quan tâm đến sản phẩm nào? Vui lòng cung cấp tên sản phẩm để tôi kiểm tra giá giúp bạn.";
    }

    if (msg.includes("mua") || msg.includes("đặt hàng")) {
      return "Bạn có thể mua hàng trực tiếp trên website hoặc để lại tên sản phẩm, tôi sẽ hướng dẫn bạn đặt hàng.";
    }

    if (msg.includes("bảo hành")) {
      return "Sản phẩm của chúng tôi được bảo hành 12 tháng. Nếu có vấn đề, bạn có thể liên hệ bộ phận kỹ thuật.";
    }

    if (msg.includes("sản phẩm") || msg.includes("có gì")) {
      return "Chúng tôi có nhiều sản phẩm linh kiện điện tử chất lượng cao. Bạn muốn tìm loại sản phẩm nào?";
    }

    if (msg.includes("gửi ko đc") || msg.includes("không gửi")) {
      return "Xin lỗi bạn! Có vẻ như có vấn đề với kết nối. Bạn có thể thử lại hoặc liên hệ trực tiếp với chúng tôi qua hotline.";
    }

    return "Cảm ơn bạn đã nhắn tin! Tôi sẽ cố gắng hỗ trợ bạn trong thời gian sớm nhất.";
  };

  return (
    <div className="chatbot-widget">
      {!open && (
        <div className="chat-button" onClick={() => setOpen(true)}>
          <span>🤖</span>
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
          <div className="chat-messages">
            <div className="welcome-message">
              <span className="bot-icon">🤖</span>
              <div className="message-bubble">
                Xin chào! Bạn cần tìm hiểu về sản phẩm, giá cả hay cần tư vấn chọn máy? Hãy nhắn cho tôi nhé!
              </div>
            </div>
            <div className="messages-container">
              {loading && <div>Đang tải...</div>}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.sender_id === "user" ? "user" : "bot"}`}
                >
                  <span className="message-bubble">{m.content}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="chat-input">
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
      )}
    </div>
  );
};

export default ChatbotWidget;