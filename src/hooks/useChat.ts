import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import API_URL from "@/config/api";

interface Message {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  photoURL: string;
  text: string;
  room: string;
  replyTo?: {
    username: string;
    text: string;
  };
  mentions?: string[];
  createdAt: string;
}

export const useChat = (auth: any) => {
  const { user, username, displayName, photoURL } = auth;
  const [activeRoom, setActiveRoom] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [cooldown, setCooldown] = useState<{
    active: boolean;
    waitSeconds: number;
  } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cooldown?.active) return;
    if (cooldown.waitSeconds <= 0) {
      setCooldown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCooldown(prev => prev ? 
        { ...prev, waitSeconds: prev.waitSeconds - 1 } : null
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    socketRef.current = io(API_URL);

    socketRef.current.on("connect", () => {
      setConnected(true);
      if (user?.uid) {
        socketRef.current?.emit("join_room", { room: activeRoom, userId: user.uid, username });
      }
    });

    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("receive_message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on("load_history", (history: Message[]) => {
      setMessages(history);
    });

    socketRef.current.on("user_typing", ({ username: typingUser }: { username: string }) => {
      setTypingUsers(prev => 
        prev.includes(typingUser) ? prev : [...prev, typingUser]
      );
    });

    socketRef.current.on("user_stop_typing", ({ username: typingUser }: { username: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== typingUser));
    });

    socketRef.current.on("cooldown_active", ({ waitSeconds }: { waitSeconds: number }) => {
      setCooldown({ active: true, waitSeconds });
    });

    return () => {
      if (user?.uid) {
        socketRef.current?.emit("leave_room", { room: activeRoom, userId: user.uid, username });
      }
      socketRef.current?.disconnect();
    };
  }, [activeRoom, user, username]);

  const sendMessage = (text: string, replyToId?: string | null) => {
    if (!socketRef.current || !text.trim() || !user) return;
    socketRef.current.emit("send_message", {
      room: activeRoom, userId: user.uid, username, displayName, photoURL, text, replyToId
    });
  };

  const startTyping = () => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit("typing", { room: activeRoom, username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { room: activeRoom, username });
    }, 2000);
  };

  return { messages, typingUsers, connected, sendMessage, startTyping, cooldown, activeRoom, setActiveRoom };
};
