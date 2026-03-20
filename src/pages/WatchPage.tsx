import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";

const WatchPage = () => {
  const { id, episode } = useParams();
  const nav = useNavigate();
  const ep = Number(episode) || 1;
  const totalEps = 24;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-20 md:px-8">
        {/* Player */}
        <div className="mb-6 flex aspect-video items-center justify-center rounded-xl border border-border bg-card">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Episode {ep}</p>
            <p className="mt-1 text-sm text-muted-foreground">Video player placeholder</p>
            <a href="#" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">
              <ExternalLink className="h-4 w-4" /> Watch Externally
            </a>
          </div>
        </div>

        {/* Nav */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => ep > 1 && nav(`/watch/${id}/${ep - 1}`)} disabled={ep <= 1} className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm font-medium text-foreground">Episode {ep} / {totalEps}</span>
          <button onClick={() => ep < totalEps && nav(`/watch/${id}/${ep + 1}`)} disabled={ep >= totalEps} className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground disabled:opacity-30">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Episode list */}
        <div className="mb-8">
          <h3 className="mb-3 font-semibold text-foreground">Episodes</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
            {Array.from({ length: totalEps }, (_, i) => (
              <button key={i} onClick={() => nav(`/watch/${id}/${i + 1}`)} className={`rounded-lg border py-2 text-center text-sm font-medium transition-colors ${i + 1 === ep ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <CommentSection />
      </div>
    </div>
  );
};

export default WatchPage;
