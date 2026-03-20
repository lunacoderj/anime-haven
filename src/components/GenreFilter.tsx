import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller", "Isekai", "Mecha", "Psychological", "School", "Shounen"];
const statuses = ["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED"];
const statusLabels: Record<string, string> = { RELEASING: "Releasing", FINISHED: "Finished", NOT_YET_RELEASED: "Not Yet Released", CANCELLED: "Cancelled" };
const types = ["Anime", "Manga"];
const sorts = ["Trending", "Popular", "Highest Rated", "Newest", "Oldest"];
const years = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

interface Props { onClose: () => void }

const GenreFilter = ({ onClose }: Props) => {
  const nav = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const toggleGenre = (g: string) => {
    setSelectedGenres(s => {
      const n = new Set(s);
      n.has(g) ? n.delete(g) : n.add(g);
      return n;
    });
  };

  const apply = () => {
    const params = new URLSearchParams();
    if (selectedGenres.size) params.set("genres", Array.from(selectedGenres).join(","));
    if (selectedStatus) params.set("status", selectedStatus);
    if (selectedType) params.set("type", selectedType);
    if (selectedSort) params.set("sort", selectedSort);
    if (selectedYear) params.set("year", selectedYear);
    nav(`/search?${params.toString()}`);
    onClose();
  };

  const clear = () => {
    setSelectedGenres(new Set());
    setSelectedStatus("");
    setSelectedType("");
    setSelectedSort("");
    setSelectedYear("");
  };

  const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
      {label}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed left-0 right-0 top-16 z-40 border-b border-border bg-card/95 p-6 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Genres</p>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => <Chip key={g} label={g} selected={selectedGenres.has(g)} onClick={() => toggleGenre(g)} />)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => <Chip key={s} label={statusLabels[s]} selected={selectedStatus === s} onClick={() => setSelectedStatus(selectedStatus === s ? "" : s)} />)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              {types.map(t => <Chip key={t} label={t} selected={selectedType === t} onClick={() => setSelectedType(selectedType === t ? "" : t)} />)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Sort</p>
            <div className="flex flex-wrap gap-2">
              {sorts.map(s => <Chip key={s} label={s} selected={selectedSort === s} onClick={() => setSelectedSort(selectedSort === s ? "" : s)} />)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Year</p>
            <div className="flex flex-wrap gap-2">
              {years.map(y => <Chip key={y} label={y} selected={selectedYear === y} onClick={() => setSelectedYear(selectedYear === y ? "" : y)} />)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={apply} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80">Apply Filters</button>
          <button onClick={clear} className="text-sm text-muted-foreground hover:text-foreground">Clear All</button>
        </div>
      </div>
    </motion.div>
  );
};

export default GenreFilter;
