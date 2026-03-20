import { useState } from "react";
import { ThumbsUp, MessageCircle, Flag } from "lucide-react";
import type { Comment } from "@/types";

const mockComments: Comment[] = [
  { id: "1", userId: "u1", username: "AnimeFan99", avatar: "", text: "This episode was absolutely incredible! The animation quality keeps getting better.", timestamp: new Date(), likes: 24, mediaId: 1 },
  { id: "2", userId: "u2", username: "MangaReader", avatar: "", text: "The fight scenes in this arc are peak anime. Can't wait for the next episode!", timestamp: new Date(), likes: 18, mediaId: 1 },
  { id: "3", userId: "u3", username: "OtakuKing", avatar: "", text: "Studio did an amazing job adapting this from the manga.", timestamp: new Date(), likes: 12, mediaId: 1 },
];

const CommentSection = () => {
  const [comments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Comments ({comments.length})</h3>

      <div className="mb-6 flex gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">U</div>
        <div className="flex flex-1 gap-2">
          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">Post</button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">{c.username[0]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{c.username}</span>
                <span className="text-xs text-muted-foreground">just now</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{c.text}</p>
              <div className="mt-2 flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3.5 w-3.5" /> {c.likes}</button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><MessageCircle className="h-3.5 w-3.5" /> Reply</button>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-red"><Flag className="h-3.5 w-3.5" /> Report</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
