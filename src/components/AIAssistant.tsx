import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Maximize2, Headset, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/config/api";
import { useAuth } from "@/context/AuthContext";

const AIAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai" | "admin"; text: string }[]>([
    { role: "ai", text: "Konnichiwa! I'm Luna, your personal anime guide. How can I help you today? ^_^" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_URL}/api/support/chat/${user.uid}`);
        if (res.data.messages) {
            setMessages(res.data.messages);
            if (res.data.status === "handoff") setHandoff(true);
        }
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/support/chat`, { 
        userId: user.uid,
        text: userMsg 
      });

      setMessages(res.data.messages);
      if (res.data.status === "handoff") setHandoff(true);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary hover:bg-primary/80 transition-all border-2 border-primary-foreground/20"
          >
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground animate-bounce">
                AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/20 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="relative">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Luna" alt="Luna" className="h-8 w-8 rounded-full bg-white/20 p-1" />
                    <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border border-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold leading-tight">Luna AI</h3>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                    onClick={() => { navigate("/chat"); setIsOpen(false); }} 
                    className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                    title="Fullscreen Mode"
                >
                    <Maximize2 className="h-4 w-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="rounded-md p-1.5 hover:bg-white/10 transition-colors">
                    <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 bg-muted/10 scrollbar-thin scrollbar-thumb-primary/20">
              {messages.map((m, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-background border border-border text-foreground rounded-tl-none"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                    <div className="rounded-2xl bg-background border border-border px-4 py-2 text-xs text-muted-foreground flex gap-1 items-center">
                        <span className="dot animate-bounce">.</span>
                        <span className="dot animate-bounce delay-100">.</span>
                        <span className="dot animate-bounce delay-200">.</span>
                        Luna is thinking
                    </div>
                </div>
              )}
              {handoff && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <button 
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-all"
                        onClick={() => navigate("/chat")}
                    >
                        <Headset className="h-3.5 w-3.5" /> Speak with an Admin
                    </button>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 bg-background">
              <div className="flex gap-2 relative">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                />
                <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || loading}
                    className="absolute right-1 top-1 flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
