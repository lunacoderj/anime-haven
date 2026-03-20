import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

interface Bookmark {
  mediaId: number;
  mediaType: "ANIME" | "MANGA";
  title: string;
  coverImage: string;
  status: "watching" | "completed" | "plan_to_watch" | "dropped" | "on_hold";
  progress: number;
  updatedAt: string;
}

export const useBookmarks = (userId: string | null) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/bookmarks/${userId}`);
      setBookmarks(res.data);
    } catch (err) {
      console.error("Failed to fetch bookmarks", err);
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (data: Omit<Bookmark, "updatedAt">) => {
    if (!userId) return;
    try {
      await axios.post(`${API_URL}/api/bookmarks`, { userId, ...data });
      await fetchBookmarks();
    } catch (err) {
      console.error("Failed to add bookmark", err);
    }
  };

  const removeBookmark = async (mediaId: number) => {
    if (!userId) return;
    try {
      await axios.delete(`${API_URL}/api/bookmarks/${userId}/${mediaId}`);
      await fetchBookmarks();
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  const isBookmarked = (mediaId: number) => 
    bookmarks.some(b => b.mediaId === mediaId);

  const getBookmarkStatus = (mediaId: number) =>
    bookmarks.find(b => b.mediaId === mediaId)?.status ?? null;

  useEffect(() => {
    fetchBookmarks();
  }, [userId]);

  return { bookmarks, loading, addBookmark, removeBookmark, isBookmarked, getBookmarkStatus, fetchBookmarks };
};
