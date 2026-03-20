import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

interface Comment {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  photoURL: string;
  text: string;
  likes: string[];
  parentId: string | null;
  createdAt: string;
  replyCount?: number;
}

export const useComments = (mediaId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/comments/${mediaId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async (data: {
    userId: string;
    username: string;
    displayName: string;
    photoURL: string;
    mediaType: string;
    text: string;
    parentId?: string;
  }) => {
    try {
      await axios.post(`${API_URL}/api/comments`, { mediaId, ...data });
      await fetchComments();
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const likeComment = async (commentId: string, userId: string) => {
    try {
      await axios.put(
        `${API_URL}/api/comments/${commentId}/like`, 
        { userId }
      );
      await fetchComments();
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`);
      await fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const fetchReplies = async (parentId: string): Promise<Comment[]> => {
    try {
      const res = await axios.get(
        `${API_URL}/api/comments/${mediaId}/replies/${parentId}`
      );
      return res.data;
    } catch (err) {
      console.error("Failed to fetch replies", err);
      return [];
    }
  };

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  return { comments, loading, postComment, likeComment, deleteComment, fetchComments, fetchReplies };
};
