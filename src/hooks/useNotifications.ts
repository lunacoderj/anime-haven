import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

interface Notification {
  _id: string;
  type: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications/${userId}`);
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await axios.put(`${API_URL}/api/notifications/${userId}/read-all`);
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { notifications, unreadCount, markAllRead, fetchNotifications };
};
