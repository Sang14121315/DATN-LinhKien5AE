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
        sender_id: currentUser?._id || "user",
        receiver_id: adminId,
        content: input,
        created_at: new Date().toISOString(),
      };
      
      // Hiển thị tin nhắn người dùng ngay lập tức
      setMessages((prev) => [...prev, userMsg]);
      const currentInput = input;
      setInput("");

      // Tạo phản hồi từ bot
      const botReply = generateBotReply(currentInput);
      
      // Hiển thị phản hồi bot sau 1 giây
      setTimeout(() => {
        const botMsg: Message = {
          sender_id: adminId,
          receiver_id: currentUser?._id || "user",
          content: botReply,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 1000);

      // Gửi tin nhắn thực sự qua API (nếu cần)
      try {
        const savedMsg = await sendMessage(adminId, currentInput);
        console.log("Tin nhắn đã được gửi:", savedMsg);
        
        // Có thể thêm logic để poll tin nhắn mới từ admin thật
        // setTimeout(() => checkForAdminReplies(), 3000);
        
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        // Không hiển thị lỗi cho user vì đã có bot reply
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

  // Hàm tạo phản hồi thông minh
  const generateBotReply = (userMessage: string): string => {
    const msg = userMessage.toLowerCase().trim();

    // Từ khóa về giá cả
    if (msg.includes("giá") || msg.includes("bao nhiêu") || msg.includes("tiền")) {
      if (msg.includes("ram") || msg.includes("bộ nhớ")) {
        return "RAM có giá từ 200k-2 triệu đồng tùy dung lượng (4GB-32GB). Bạn cần RAM bao nhiêu GB?";
      }
      if (msg.includes("cpu") || msg.includes("chip")) {
        return "CPU có giá từ 500k-15 triệu đồng tùy loại (Intel/AMD). Bạn muốn tìm CPU nào?";
      }
      if (msg.includes("mainboard") || msg.includes("bo mạch chủ")) {
        return "Mainboard có giá từ 1-10 triệu đồng tùy chipset và hãng. Bạn cần mainboard cho CPU nào?";
      }
      if (msg.includes("vga") || msg.includes("card màn hình") || msg.includes("gpu")) {
        return "Card màn hình có giá từ 2-50 triệu đồng tùy cấu hình. Bạn cần card gaming hay văn phòng?";
      }
      if (msg.includes("ổ cứng") || msg.includes("hdd") || msg.includes("ssd")) {
        return "Ổ cứng có giá từ 500k-5 triệu đồng tùy dung lượng. SSD nhanh hơn HDD. Bạn cần bao nhiêu GB?";
      }
      if (msg.includes("psu") || msg.includes("nguồn")) {
        return "Nguồn máy tính có giá từ 500k-5 triệu đồng tùy công suất. Bạn cần nguồn bao nhiêu W?";
      }
      return "Bạn đang quan tâm đến linh kiện nào? Vui lòng cung cấp tên sản phẩm để tôi kiểm tra giá chi tiết.";
    }

    // Từ khóa về mua hàng
    if (msg.includes("mua") || msg.includes("đặt hàng") || msg.includes("thanh toán")) {
      if (msg.includes("online") || msg.includes("website")) {
        return "Bạn có thể mua hàng trực tiếp trên website bằng cách thêm vào giỏ hàng và thanh toán online.";
      }
      if (msg.includes("tiền mặt") || msg.includes("cod")) {
        return "Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản. Bạn muốn thanh toán cách nào?";
      }
      return "Bạn có thể mua hàng trực tiếp trên website hoặc để lại tên linh kiện, tôi sẽ hướng dẫn bạn đặt hàng.";
    }

    // Từ khóa về bảo hành
    if (msg.includes("bảo hành") || msg.includes("warranty") || msg.includes("đổi trả")) {
      if (msg.includes("bao lâu") || msg.includes("thời gian")) {
        return "Linh kiện của chúng tôi được bảo hành 12-36 tháng tùy loại. RAM/SSD bảo hành 36 tháng, CPU/Mainboard 24 tháng.";
      }
      if (msg.includes("lỗi") || msg.includes("hỏng")) {
        return "Nếu linh kiện có lỗi trong thời gian bảo hành, chúng tôi sẽ sửa chữa hoặc đổi mới. Bạn có thể mang đến cửa hàng hoặc gọi hotline.";
      }
      return "Linh kiện của chúng tôi được bảo hành chính hãng. Bạn cần tư vấn về bảo hành linh kiện nào?";
    }

    // Từ khóa về sản phẩm
    if (msg.includes("sản phẩm") || msg.includes("có gì") || msg.includes("bán gì")) {
      if (msg.includes("ram") || msg.includes("bộ nhớ")) {
        return "Chúng tôi có RAM DDR4, DDR5 từ các hãng Kingston, Corsair, G.Skill... Bạn cần RAM bao nhiêu GB?";
      }
      if (msg.includes("cpu") || msg.includes("chip")) {
        return "Chúng tôi có CPU Intel và AMD từ các dòng Core i3/i5/i7/i9, Ryzen 3/5/7/9. Bạn cần CPU nào?";
      }
      if (msg.includes("mainboard") || msg.includes("bo mạch")) {
        return "Chúng tôi có Mainboard Intel và AMD từ các hãng Asus, MSI, Gigabyte. Bạn cần mainboard cho CPU nào?";
      }
      if (msg.includes("vga") || msg.includes("card")) {
        return "Chúng tôi có Card màn hình từ NVIDIA và AMD, từ GTX đến RTX. Bạn cần card gaming hay văn phòng?";
      }
      return "Chúng tôi có đầy đủ linh kiện máy tính: CPU, RAM, Mainboard, VGA, ổ cứng, nguồn, tản nhiệt... Bạn cần linh kiện gì?";
    }

    // Từ khóa về giao hàng
    if (msg.includes("giao hàng") || msg.includes("ship") || msg.includes("vận chuyển")) {
      if (msg.includes("phí") || msg.includes("tiền ship")) {
        return "Phí ship từ 20k-50k tùy địa chỉ. Miễn phí ship cho đơn hàng trên 500k. Bạn ở đâu?";
      }
      if (msg.includes("bao lâu") || msg.includes("mấy ngày")) {
        return "Thời gian giao hàng 1-3 ngày trong TP.HCM, 3-7 ngày các tỉnh khác. Bạn ở đâu?";
      }
      return "Chúng tôi giao hàng toàn quốc. Bạn ở đâu để tôi tư vấn thời gian và phí ship?";
    }

    // Từ khóa về khuyến mãi
    if (msg.includes("giảm giá") || msg.includes("sale") || msg.includes("khuyến mãi")) {
      return "Hiện tại chúng tôi có nhiều chương trình khuyến mãi: giảm giá RAM, tặng quạt tản nhiệt khi mua CPU, combo CPU+Mainboard giá tốt. Bạn quan tâm linh kiện nào?";
    }

    // Từ khóa về chất lượng
    if (msg.includes("chất lượng") || msg.includes("tốt không") || msg.includes("uy tín")) {
      return "Chúng tôi cam kết bán linh kiện chính hãng 100%, có giấy tờ bảo hành đầy đủ. Nhiều khách hàng đã tin tưởng chúng tôi trong 5 năm qua.";
    }

    // Từ khóa về liên hệ
    if (msg.includes("liên hệ") || msg.includes("số điện thoại") || msg.includes("hotline")) {
      return "Bạn có thể liên hệ chúng tôi qua: Hotline: 0901234567, Email: contact@5ae.com, hoặc đến cửa hàng tại 123 ABC Street, TP.HCM.";
    }

    // Từ khóa về giờ làm việc
    if (msg.includes("giờ") || msg.includes("mở cửa") || msg.includes("làm việc")) {
      return "Cửa hàng mở cửa từ 8h-22h tất cả các ngày trong tuần. Bạn có thể đến bất cứ lúc nào.";
    }

    // Từ khóa về địa chỉ
    if (msg.includes("ở đâu") || msg.includes("địa chỉ") || msg.includes("đường")) {
      return "Cửa hàng chúng tôi ở 123 ABC Street, Quận 1, TP.HCM. Gần chợ Bến Thành, dễ tìm lắm.";
    }

    // Từ khóa về tư vấn
    if (msg.includes("tư vấn") || msg.includes("chọn") || msg.includes("nên mua")) {
      if (msg.includes("ram")) {
        return "Để tư vấn RAM phù hợp, bạn cho biết: 1) Mainboard hiện tại? 2) Mục đích sử dụng? 3) Ngân sách?";
      }
      if (msg.includes("cpu")) {
        return "Để tư vấn CPU phù hợp, bạn cho biết: 1) Mục đích sử dụng (gaming/văn phòng/đồ họa)? 2) Ngân sách? 3) Mainboard hiện tại?";
      }
      if (msg.includes("mainboard")) {
        return "Để tư vấn Mainboard phù hợp, bạn cho biết: 1) CPU muốn dùng? 2) Mục đích sử dụng? 3) Ngân sách?";
      }
      if (msg.includes("vga") || msg.includes("card")) {
        return "Để tư vấn Card màn hình phù hợp, bạn cho biết: 1) Mục đích sử dụng (gaming/văn phòng/đồ họa)? 2) Ngân sách? 3) CPU hiện tại?";
      }
      return "Tôi sẽ tư vấn linh kiện phù hợp. Bạn cần tư vấn về linh kiện nào?";
    }

    // Từ khóa về lỗi kỹ thuật
    if (msg.includes("lỗi") || msg.includes("không gửi") || msg.includes("gửi ko đc")) {
      return "Xin lỗi bạn! Có vẻ như có vấn đề với kết nối. Bạn có thể thử lại hoặc liên hệ trực tiếp với chúng tôi qua hotline: 0901234567.";
    }

    // Từ khóa chào hỏi
    if (msg.includes("xin chào") || msg.includes("hello") || msg.includes("hi")) {
      return "Xin chào! Rất vui được gặp bạn. Tôi có thể giúp gì cho bạn hôm nay?";
    }

    // Từ khóa cảm ơn
    if (msg.includes("cảm ơn") || msg.includes("thanks") || msg.includes("thank")) {
      return "Không có gì! Nếu cần hỗ trợ thêm, đừng ngại nhắn tin cho tôi nhé. Chúc bạn một ngày tốt lành! 😊";
    }

    // Từ khóa tạm biệt
    if (msg.includes("tạm biệt") || msg.includes("bye") || msg.includes("goodbye")) {
      return "Tạm biệt bạn! Cảm ơn đã ghé thăm 5AE. Hẹn gặp lại! 👋";
    }

    // Phản hồi mặc định
    return "Cảm ơn bạn đã nhắn tin! Tôi có thể giúp bạn tìm hiểu về linh kiện máy tính, giá cả, bảo hành, giao hàng... Bạn cần tư vấn gì?";
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
                Xin chào! Bạn cần tìm hiểu về linh kiện, giá cả hay cần tư vấn chọn linh kiện? Hãy nhắn cho tôi nhé!
              </div>
            </div>
            <div className="messages-container">
              {loading && <div className="loading-message">Đang tải...</div>}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.sender_id === currentUser?._id || m.sender_id === "user" ? "user" : "bot"}`}
                >
                  {m.sender_id === currentUser?._id || m.sender_id === "user" ? (
                    <span className="message-bubble user-message">{m.content}</span>
                  ) : (
                    <div className="bot-message">
                      <span className="bot-icon">🤖</span>
                      <span className="message-bubble bot-bubble">{m.content}</span>
                    </div>
                  )}
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