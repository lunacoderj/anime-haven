import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Megaphone, Send, Star, Book, AlertTriangle, Reply, X, CornerDownRight, MessageSquare, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/hooks/useChat";

const rooms = [
  { id: "general", name: "General Chat", icon: Hash },
  { id: "announcements", name: "Announcements", icon: Megaphone },
  { id: "recommendations", name: "Recommendations", icon: Star },
  { id: "manga-talk", name: "Manga Talk", icon: Book },
  { id: "spoilers", name: "Spoilers", icon: AlertTriangle },
  { id: "luna", name: "Luna AI", icon: Sparkles },
];

const ChatPage = () => {
  const auth = useAuth();
  const { user } = auth;
  const { 
    messages, 
    sendMessage, 
    activeRoom, 
    setActiveRoom, 
    connected, 
    typingUsers, 
    startTyping,
    cooldown 
  } = useChat(auth);
  
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) setActiveRoom(roomParam);
  }, [setActiveRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user || !connected || (cooldown?.active)) return;
    sendMessage(input, replyingTo?._id);
    setInput("");
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} className="font-bold text-accent-yellow drop-shadow-sm">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl md:flex">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold tracking-tight text-foreground">Community</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Live Rooms</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeRoom === room.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <room.icon className={`h-4 w-4 ${activeRoom === room.id ? "" : "text-primary/60"}`} />
                {room.name}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter ${connected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {connected ? "Connection Stable" : "Disconnected"}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col relative overflow-hidden">
          <div className="flex flex-1 flex-col min-h-0 bg-card/30">
            {/* Room Header */}
            <div className="flex items-center justify-between border-b border-border bg-background/50 p-4 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        {rooms.find(r => r.id === activeRoom)?.icon && 
                         (() => {
                            const Icon = rooms.find(r => r.id === activeRoom)!.icon;
                            return <Icon className="h-5 w-5" />;
                         })()
                        }
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">#{rooms.find(r => r.id === activeRoom)?.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active Room</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-4 pb-32 scroll-smooth bg-muted/5">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3">
                        <div className="p-4 rounded-full bg-muted/20">
                            <MessageSquare className="h-8 w-8 text-primary/40" />
                        </div>
                        <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isOwn = m.userId === user?.uid;
                        const isLuna = m.userId === "luna_bot";
                        const mentionsMe = m.mentions?.includes(user?.username || "");
                        const isReplyToMe = (m.replyTo as any)?.username === user?.username;
                        const highlighted = mentionsMe || isReplyToMe;

                        return (
                            <motion.div 
                                key={m._id} 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group relative`}
                            >
                                {m.replyTo && (
                                    <div className={`flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full ${isOwn ? 'mr-12' : 'ml-12'}`}>
                                        <CornerDownRight className="h-3 w-3" />
                                        <span className="font-semibold italic">Replying to @{(m.replyTo as any).username}</span>
                                        <span className="opacity-50 truncate max-w-[100px]">"{(m.replyTo as any).text}"</span>
                                    </div>
                                )}

                                <div className={`flex items-start gap-3 max-w-[85%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={m.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.userId}`} 
                                            className={`h-10 w-10 rounded-xl object-cover shadow-sm bg-muted ${isLuna ? 'border-2 border-primary ring-2 ring-primary/20' : ''}`} 
                                            alt="" 
                                        />
                                        {isLuna && (
                                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 border border-background shadow-lg">
                                                <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold ${isLuna ? 'text-primary' : 'text-foreground'}`}>
                                                {m.displayName || m.username}
                                                {isLuna && <span className="ml-1 px-1 rounded bg-primary/20 text-[9px] uppercase tracking-tighter">AI</span>}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        
                                        <div className={`group relative rounded-2xl px-4 py-2.5 shadow-sm text-sm transition-all duration-300 ${
                                            isOwn 
                                                ? "bg-primary text-primary-foreground rounded-tr-none hover:bg-primary/90 shadow-md shadow-primary/10" 
                                                : isLuna
                                                    ? "bg-primary/5 border border-primary/20 text-foreground rounded-tl-none ring-1 ring-primary/10"
                                                    : highlighted
                                                        ? "bg-yellow-500/10 border-2 border-yellow-500/30 text-foreground rounded-tl-none scale-[1.02] shadow-md shadow-yellow-500/5 rotate-1"
                                                        : "bg-card border border-border text-foreground rounded-tl-none hover:border-primary/50 shadow-sm"
                                        }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{renderText(m.text)}</p>
                                            
                                            {!isOwn && !isLuna && (
                                                <button 
                                                    onClick={() => setReplyingTo(m)}
                                                    className="absolute -right-10 top-1/2 -translate-y-1/2 rounded-full bg-muted p-2 text-muted-foreground opacity-0 transition-all hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 shadow-md border border-border/50"
                                                >
                                                    <Reply className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                {typingUsers.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-muted-foreground italic p-2">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                        </div>
                        <span>{typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...</span>
                    </motion.div>
                )}
            </div>

            {/* Input Container */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 bg-background/80 backdrop-blur-xl z-10 shadow-lg">
                <AnimatePresence>
                    {replyingTo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-3 border border-primary/20 bg-primary/5 rounded-xl p-3 flex items-center justify-between shadow-inner"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <Reply className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Replying to @{replyingTo.username}</p>
                                    <p className="truncate text-xs text-muted-foreground italic">"{replyingTo.text}"</p>
                                </div>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-muted rounded-full transition-colors group">
                                <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input 
                            value={input} 
                            onChange={e => { setInput(e.target.value); startTyping(); }} 
                            onKeyDown={handleKeyDown}
                            placeholder={cooldown?.active ? "Anti-spam lock active..." : `Message #${activeRoom}...`} 
                            disabled={!connected || !user || cooldown?.active}
                            className={`w-full rounded-2xl border bg-muted/30 pl-4 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all ${
                                replyingTo ? "rounded-t-none border-t-0 shadow-inner" : "border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                            } disabled:opacity-50`} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded border border-border/50 pointer-events-none uppercase tracking-tighter shadow-sm">
                            Enter
                        </div>
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || !connected || !user || cooldown?.active}
                        className="rounded-2xl bg-primary p-3.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-primary/30 flex items-center justify-center min-w-[52px]"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                    <div className="flex gap-2">
                        {messages.length > 0 && messages[messages.length-1].userId === user?.uid && (messages[messages.length-1] as any).messageCount < 3 && (
                            <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-yellow-500/20">
                                {(messages[messages.length-1] as any).messageCount}/3 Limit
                            </span>
                        )}
                    </div>
                    {cooldown?.active && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-accent-red font-black uppercase tracking-widest bg-accent-red/10 px-2 py-1 rounded-lg border border-accent-red/20 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse" />
                                Wait {cooldown.waitSeconds}s
                            </span>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
