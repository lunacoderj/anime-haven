import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

const AIAssistant = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { role: "ai" as const, text: "Hi! I'm your AI anime assistant. Ask me for recommendations, character info, or anything anime-related!" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: "user" as const, text: input }, { role: "ai" as const, text: "That's a great question! Based on your interests, I'd recommend checking out Jujutsu Kaisen and Chainsaw Man for action-packed series." }]);
    setInput("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/50" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-full flex-col border-l border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><span className="font-semibold text-foreground">AI Assistant</span></div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about anime..." className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
                <button onClick={send} className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/80"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
