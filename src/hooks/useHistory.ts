import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

interface HistoryItem {
  mediaId: number;
  mediaType: "ANIME" | "MANGA";
  title: string;
  coverImage: string;
  episodeOrChapter: number;
  watchedAt: string;
}

export const useHistory = (userId: string | null) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (data: Omit<HistoryItem, "watchedAt">) => {
    if (!userId) return;
    try {
      await axios.post(`${API_URL}/api/history`, { userId, ...data });
    } catch (err) {
      console.error("Failed to add to history", err);
    }
  };

  const clearHistory = async () => {
    if (!userId) return;
    try {
      await axios.delete(`${API_URL}/api/history/${userId}`);
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  return { history, loading, addToHistory, clearHistory, fetchHistory };
};
