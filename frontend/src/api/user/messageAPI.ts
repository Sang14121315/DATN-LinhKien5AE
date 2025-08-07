import axios from '../axios';

export interface Message {
  _id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

// Lấy lịch sử hội thoại
export const fetchConversation = async (receiverId: string): Promise<Message[]> => {
  try {
    const response = await axios.get(`/api/messages/conversation/${receiverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return [];
  }
};

// Gửi tin nhắn
export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  try {
    const response = await axios.post('/api/messages', {
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
    const response = await axios.get('/api/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}; 