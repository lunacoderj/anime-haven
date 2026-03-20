import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Tag, MessageSquare, Send, Heart, Rocket, Flame, PartyPopper, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import API_URL from "@/config/api";

interface Comment {
  username: string;
  displayName: string;
  photoURL: string;
  text: string;
  timestamp: string;
}

interface ReleaseNote {
  _id: string;
  title: string;
  content: string;
  version: string;
  date: string;
  emojis: Record<string, number>;
  comments: Comment[];
}

const ReleaseNotesPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/release-notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch release notes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleEmoji = async (noteId: string, emoji: string) => {
    try {
      const res = await axios.post(`${API_URL}/api/release-notes/${noteId}/emoji`, { emoji });
      setNotes(prev => prev.map(n => n._id === noteId ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (noteId: string) => {
    const text = commentInputs[noteId];
    if (!text?.trim() || !user) return;

    try {
      const res = await axios.post(`${API_URL}/api/release-notes/${noteId}/comments`, {
        username: user.username || "anon",
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL,
        text
      });
      setNotes(prev => prev.map(n => n._id === noteId ? res.data : n));
      setCommentInputs(prev => ({ ...prev, [noteId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pt-24 pb-12">
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight gradient-text mb-4">Release Notes</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Stay updated with the latest features, improvements, and bug fixes in Anime Haven.</p>
        </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Fetching the latest updates...</p>
            </div>
        ) : (
            <div className="space-y-8 relative">
                {/* Timeline Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-border/50 hidden md:block" />

                {notes.map((note, index) => (
                    <motion.article 
                        key={note._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-0 md:pl-14"
                    >
                        {/* Timeline Bullet */}
                        <div className="absolute left-4 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background z-10 hidden md:block" />

                        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:border-primary/30 transition-all duration-300">
                            {/* Note Header */}
                            <div className="p-6 border-b border-border bg-muted/20">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                            v{note.version}
                                        </div>
                                        <h2 className="text-xl font-bold">{note.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(note.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground lead-relaxed">
                                    {note.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Interactions Area */}
                            <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-muted/10">
                                <div className="flex items-center gap-2">
                                    {[
                                        { symbol: "🚀", icon: Rocket },
                                        { symbol: "❤️", icon: Heart },
                                        { symbol: "🔥", icon: Flame },
                                        { symbol: "🎉", icon: PartyPopper }
                                    ].map(({ symbol, icon: Icon }) => (
                                        <button 
                                            key={symbol}
                                            onClick={() => handleEmoji(note._id, symbol)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all text-xs font-bold group"
                                        >
                                            <span className="group-hover:scale-125 transition-transform">{symbol}</span>
                                            <span className="text-muted-foreground group-hover:text-primary">{note.emojis[symbol] || 0}</span>
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => toggleExpand(note._id)}
                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    {note.comments.length} Comments
                                    {expandedNotes[note._id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Comments Section */}
                            <AnimatePresence>
                                {expandedNotes[note._id] && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border bg-muted/5 p-6"
                                    >
                                        <div className="space-y-4 mb-6">
                                            {note.comments.map((c, i) => (
                                                <div key={i} className="flex gap-3 items-start">
                                                    <img src={c.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`} className="h-8 w-8 rounded-full bg-muted shadow-sm" alt="" />
                                                    <div className="flex-1 bg-background border border-border/50 rounded-xl p-3 shadow-sm">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold text-foreground">{c.displayName}</span>
                                                            <span className="text-[10px] text-muted-foreground">{new Date(c.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{c.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {note.comments.length === 0 && (
                                                <p className="text-center text-xs text-muted-foreground py-4 italic">No comments yet. Be the first to react!</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <input 
                                                value={commentInputs[note._id] || ""}
                                                onChange={e => setCommentInputs(prev => ({ ...prev, [note._id]: e.target.value }))}
                                                placeholder="Write a comment..."
                                                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                                            />
                                            <button 
                                                onClick={() => handleComment(note._id)}
                                                disabled={!commentInputs[note._id]?.trim()}
                                                className="rounded-xl bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.article>
                ))}

                {notes.length === 0 && !loading && (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border-2 border-dashed border-border">
                        <Tag className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-bold">No release notes found</h3>
                        <p className="text-sm text-muted-foreground">Keep an eye out for future updates!</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseNotesPage;
