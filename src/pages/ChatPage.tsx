import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, Megaphone, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { Message } from "@/types";

const rooms = [
  { id: "general", name: "General", icon: Hash },
  { id: "announcements", name: "Announcements", icon: Megaphone },
  { id: "anime-talk", name: "Anime Talk", icon: Hash },
  { id: "manga-talk", name: "Manga Talk", icon: Hash },
];

const mockMessages: Message[] = [
  { id: "1", userId: "u1", username: "NarutoFan", avatar: "", text: "Has anyone watched the latest episode of JJK?", timestamp: new Date(), room: "general" },
  { id: "2", userId: "u2", username: "AnimeLover", avatar: "", text: "Yes! The animation was incredible! Mappa really outdid themselves.", timestamp: new Date(), room: "general" },
  { id: "3", userId: "u3", username: "OtakuKing", avatar: "", text: "The fight choreography was next level 🔥", timestamp: new Date(), room: "general" },
  { id: "4", userId: "123", username: "TestUser", avatar: "", text: "I agree! Can't wait for the next episode!", timestamp: new Date(), room: "general" },
];

const ChatPage = () => {
  const [activeRoom, setActiveRoom] = useState("general");
  const [messages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const filteredMessages = messages.filter(m => m.room === activeRoom);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} w-72 flex-shrink-0 flex-col border-r border-border bg-card md:flex`}>
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-foreground">AnimeWorld Chat</h2>
            <p className="text-xs text-muted-foreground">42 online</p>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {rooms.map(r => (
              <button key={r.id} onClick={() => { setActiveRoom(r.id); setShowSidebar(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${activeRoom === r.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <r.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <button onClick={() => setShowSidebar(s => !s)} className="mr-3 text-foreground md:hidden">☰</button>
              <span className="font-semibold text-foreground">#{activeRoom}</span>
              <span className="ml-2 text-xs text-muted-foreground">12 members</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {filteredMessages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.userId === "123" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${m.userId === "123" ? "" : "flex gap-3"}`}>
                  {m.userId !== "123" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">{m.username[0]}</div>
                  )}
                  <div className={`rounded-xl px-4 py-2.5 ${m.userId === "123" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {m.userId !== "123" && <p className="mb-0.5 text-xs font-semibold text-primary">{m.username}</p>}
                    <p className="text-sm">{m.text}</p>
                    <p className="mt-1 text-[10px] opacity-60">just now</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Message #${activeRoom}`} className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              <button className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/80"><Send className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
