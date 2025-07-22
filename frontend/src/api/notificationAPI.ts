// src/api/notificationAPI.ts
import axios from 'axios';

export interface Notification {
  _id: string;
  user_id: string;
  content: string;
  read: boolean;
  type: string;
  related_id: string;
  related_model: string;
  created_at: string;
  updated_at: string;
}

export const getNotificationsByUser = async (userId: string): Promise<Notification[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`http://localhost:5000/api/notifications?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAllNotifications = async (userId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`http://localhost:5000/api/notifications?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};