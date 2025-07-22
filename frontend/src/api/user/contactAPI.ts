import axios from 'axios';

// Kiểu dữ liệu Contact
export interface Contact {
  _id?: string;
  title: string;
  message: string;
  name: string;
  email: string;
  phone: string;
  user_id?: string | null;
  message_id?: string | null;
  status?: 'pending' | 'replied' | 'closed';
  created_at?: string;
  updated_at?: string;
}

const BASE_URL = 'http://localhost:5000/api';

// Gửi liên hệ mới
export const sendContact = async (data: Contact): Promise<Contact> => {
  const response = await axios.post(`${BASE_URL}/contact`, data);
  return response.data;
};

// Lấy danh sách liên hệ
export const fetchAllContacts = async (): Promise<Contact[]> => {
  const response = await axios.get(`${BASE_URL}/contact`);
  return response.data;
};

// Lấy chi tiết liên hệ
export const fetchContactById = async (id: string): Promise<Contact> => {
  const response = await axios.get(`${BASE_URL}/contact/${id}`);
  return response.data;
};

// Cập nhật liên hệ (ví dụ: cập nhật trạng thái hoặc phản hồi)
export const updateContact = async (
  id: string,
  updatedData: Partial<Omit<Contact, '_id' | 'created_at' | 'updated_at'>>
): Promise<Contact> => {
  const response = await axios.put(`${BASE_URL}/contact/${id}`, updatedData);
  return response.data;
};

// Xóa liên hệ
export const deleteContact = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${BASE_URL}/contact/${id}`);
  return response.data;
};
