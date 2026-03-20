import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";

const ReadPage = () => {
  const { id, chapter } = useParams();
  const nav = useNavigate();
  const ch = Number(chapter) || 1;
  const totalCh = 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 pt-20 md:px-8">
        <div className="mb-6 flex aspect-[3/4] items-center justify-center rounded-xl border border-border bg-card">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Chapter {ch}</p>
            <p className="mt-1 text-sm text-muted-foreground">Reader placeholder</p>
            <a href="#" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
              <ExternalLink className="h-4 w-4" /> Read Externally
            </a>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => ch > 1 && nav(`/read/${id}/${ch - 1}`)} disabled={ch <= 1} className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm font-medium text-foreground">Chapter {ch} / {totalCh}</span>
          <button onClick={() => ch < totalCh && nav(`/read/${id}/${ch + 1}`)} disabled={ch >= totalCh} className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground disabled:opacity-30">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 font-semibold text-foreground">Chapters</h3>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {Array.from({ length: 20 }, (_, i) => (
              <button key={i} onClick={() => nav(`/read/${id}/${i + 1}`)} className={`rounded-lg border py-2 text-center text-sm font-medium transition-colors ${i + 1 === ch ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-foreground hover:bg-muted"}`}>
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

export default ReadPage;
