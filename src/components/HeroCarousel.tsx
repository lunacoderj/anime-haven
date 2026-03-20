import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Anime } from "@/types";

interface Props {
  items: Anime[];
}

const HeroCarousel = ({ items }: Props) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const nav = useNavigate();

  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (paused || !items.length) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next, items.length]);

  if (!items.length) return null;
  const anime = items[current];

  return (
    <div className="relative h-[70vh] w-full overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img src={anime.bannerImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center px-8 md:px-16">
        <motion.div key={current} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {anime.genres.map(g => (
              <span key={g} className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">{g}</span>
            ))}
          </div>
          <h1 className="mb-2 text-4xl font-bold text-foreground md:text-5xl">{anime.title.english || anime.title.romaji}</h1>
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-accent-yellow">★ {(anime.averageScore / 10).toFixed(1)}</span>
            <span>{anime.episodes} Episodes</span>
            <span>{anime.format}</span>
          </div>
          <p className="mb-6 line-clamp-3 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: anime.description }} />
          <div className="flex gap-3">
            <button onClick={() => nav(`/watch/${anime.id}/1`)} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/80">
              <Play className="h-5 w-5" /> Watch Now
            </button>
            <button onClick={() => nav(`/details/${anime.id}`)} className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted">
              <Info className="h-5 w-5" /> Details
            </button>
          </div>
        </motion.div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground backdrop-blur hover:bg-background/80">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/50 p-2 text-foreground backdrop-blur hover:bg-background/80">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
