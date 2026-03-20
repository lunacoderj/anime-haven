import { useState } from "react";
import { ThumbsUp, MessageCircle, Flag, Loader2, ChevronDown, ChevronUp, Reply, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useComments } from "@/hooks/useComments";

interface CommentSectionProps {
  mediaId: number;
  mediaType: "ANIME" | "MANGA";
}

const CommentSection = ({ mediaId, mediaType }: CommentSectionProps) => {
  const { user } = useAuth();
  const { comments, loading, postComment, likeComment, fetchReplies } = useComments(mediaId);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Record<string, any[]>>({});

  const handlePost = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim() || !user?.uid) return;
    setIsPosting(true);
    await postComment({
      userId: user.uid,
      username: user.username || user.displayName || "User",
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
      mediaType,
      text: text.trim(),
      parentId
    });
    if (parentId) {
      setReplyText("");
      setReplyingTo(null);
      // Refresh replies for this parent
      const newReplies = await fetchReplies(parentId);
      setRepliesMap(prev => ({ ...prev, [parentId]: newReplies }));
      setExpandedReplies(prev => new Set(prev).add(parentId));
    } else {
      setNewComment("");
    }
    setIsPosting(false);
  };

  const toggleReplies = async (parentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
      if (!repliesMap[parentId]) {
        const reps = await fetchReplies(parentId);
        setRepliesMap(prev => ({ ...prev, [parentId]: reps }));
      }
    }
    setExpandedReplies(newExpanded);
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 mt-8">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Comments ({comments.length})</h3>

      {!user ? (
          <div className="mb-6 rounded-lg bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Please <button onClick={() => window.location.href='/auth'} className="text-primary hover:underline font-semibold">login</button> to join the discussion.
          </div>
      ) : (
          <div className="mb-6 flex gap-3">
              {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
              ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {user.displayName?.[0]?.toUpperCase() || "U"}
                  </div>
              )}
              <div className="flex flex-1 gap-2">
                  <input 
                      value={newComment} 
                      onChange={e => setNewComment(e.target.value)} 
                      placeholder="Add a comment..." 
                      disabled={isPosting}
                      className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" 
                  />
                  <button 
                      disabled={!newComment.trim() || isPosting}
                      onClick={() => handlePost()} 
                      className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-all active:scale-95"
                  >
                      {isPosting && !replyingTo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                  </button>
              </div>
          </div>
      )}

      <div className="space-y-6">
        {loading ? (
            <div className="flex justify-center p-4 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No comments yet. Be the first!</p>
        ) : (
          comments.map(c => {
            const isLiked = user?.uid && c.likes?.includes(user.uid);
            const isReplying = replyingTo?.id === c._id;
            const isExpanded = expandedReplies.has(c._id);
            const replies = repliesMap[c._id] || [];

            return (
              <div key={c._id} className="group">
                <div className="flex gap-3">
                  {c.photoURL ? (
                      <img src={c.photoURL} className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-muted ring-2 ring-border/20" alt="" />
                  ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground ring-2 ring-border/20">{c.username?.[0] || "U"}</div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary/90">{c.displayName || c.username}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90 leading-relaxed">{c.text}</p>
                    <div className="mt-3 flex items-center gap-4 text-muted-foreground">
                      <button onClick={() => user?.uid && likeComment(c._id, user.uid)} className={`flex items-center gap-1.5 text-xs transition-colors hover:text-primary ${isLiked ? 'text-primary' : ''}`}>
                          <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} /> 
                          <span className="font-medium">{c.likes?.length || 0}</span>
                      </button>
                      <button onClick={() => setReplyingTo({ id: c._id, username: c.username })} className="flex items-center gap-1.5 text-xs transition-colors hover:text-primary font-medium">
                        <Reply className="h-3.5 w-3.5" /> Reply
                      </button>
                      <button className="flex items-center gap-1.5 text-xs transition-colors hover:text-accent-red font-medium">
                        <Flag className="h-3.5 w-3.5" /> Report
                      </button>
                    </div>

                    {/* Inline Reply Input */}
                    {isReplying && (
                      <div className="mt-4 flex gap-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex-1">
                          <textarea 
                            autoFocus
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Replying to @${replyingTo?.username}...`}
                            className="w-full rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground focus:border-primary focus:outline-none min-h-[80px] resize-none"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button onClick={() => setReplyingTo(null)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                              <X className="h-3 w-3" /> Cancel
                            </button>
                            <button 
                              disabled={!replyText.trim() || isPosting}
                              onClick={() => handlePost(c._id)}
                              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                            >
                              {isPosting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Post Reply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies Toggle */}
                    {c.replyCount > 0 && (
                      <div className="mt-2">
                        <button 
                          onClick={() => toggleReplies(c._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group/btn"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />}
                          {isExpanded ? "Hide replies" : `Show ${c.replyCount} replies`}
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {isExpanded && (
                      <div className="mt-4 space-y-4 border-l-2 border-border/50 ml-2 pl-6 animate-in fade-in duration-300">
                        {replies.length === 0 ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Loading replies...
                          </div>
                        ) : (
                          replies.map(r => (
                            <div key={r._id} className="flex gap-2">
                              {r.photoURL ? (
                                <img src={r.photoURL} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover bg-muted ring-1 ring-border/20" />
                              ) : (
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                  {r.username?.[0] || "U"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-teal-500">{r.displayName || r.username}</span>
                                  <span className="text-[9px] text-muted-foreground">{formatTime(r.createdAt)}</span>
                                </div>
                                <p className="mt-0.5 text-sm text-foreground/80">{r.text}</p>
                                <div className="mt-1 flex items-center gap-3">
                                  <button onClick={() => user?.uid && likeComment(r._id, user.uid)} className={`flex items-center gap-1 text-[10px] hover:text-primary ${user?.uid && r.likes?.includes(user.uid) ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <ThumbsUp className="h-3 w-3" /> {r.likes?.length || 0}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
