import axios from '../axios';

export interface Message {
  _id?: string;
  sender_id: string | { _id: string; name?: string; email?: string };
  receiver_id: string | { _id: string; name?: string; email?: string };
  content: string;
  created_at: string;
}

// Lấy lịch sử hội thoại
export const fetchConversation = async (receiverId: string): Promise<Message[]> => {
  try {
    const response = await axios.get(`/messages`, { params: { receiver_id: receiverId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return [];
  }
};

// Gửi tin nhắn
export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  try {
    const response = await axios.post('/messages', {
      receiver_id: receiverId,
      content: content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Trả về tin nhắn giả nếu API lỗi
    return {
      sender_id: 'currentUser',
      receiver_id: receiverId,
      content: content,
      created_at: new Date().toISOString()
    };
  }
};

// Lấy tất cả tin nhắn
export const fetchAllMessages = async (): Promise<Message[]> => {
  try {
    const response = await axios.get('/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}; 