import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller", "Isekai", "Mecha", "Psychological", "School", "Shounen"];
const statuses = ["Releasing", "Finished", "Not Yet Released", "Cancelled"];
const types = ["Anime", "Manga", "Manhwa", "Manhua"];
const sorts = ["Trending", "Popular", "Highest Rated", "Newest", "Oldest"];
const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "Older"];

interface Props { onClose: () => void }

const GenreFilter = ({ onClose }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (v: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(v) ? n.delete(v) : n.add(v);
      return n;
    });
  };

  const Chips = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-2">
      {items.map(i => (
        <button key={i} onClick={() => toggle(i)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selected.has(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
          {i}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed left-0 right-0 top-16 z-40 border-b border-border bg-card/95 p-6 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div><p className="mb-2 text-xs font-medium text-muted-foreground">Genres</p><Chips items={genres} /></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><p className="mb-2 text-xs font-medium text-muted-foreground">Status</p><Chips items={statuses} /></div>
          <div><p className="mb-2 text-xs font-medium text-muted-foreground">Type</p><Chips items={types} /></div>
          <div><p className="mb-2 text-xs font-medium text-muted-foreground">Sort</p><Chips items={sorts} /></div>
          <div><p className="mb-2 text-xs font-medium text-muted-foreground">Year</p><Chips items={years} /></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">Apply Filters</button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-muted-foreground hover:text-foreground">Clear All</button>
        </div>
      </div>
    </motion.div>
  );
};

export default GenreFilter;
