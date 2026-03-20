import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Info } from "lucide-react";
import type { Anime } from "@/types";

interface Props {
  anime: Anime;
  rank?: number;
}

const AnimeCard = ({ anime, rank }: Props) => {
  const nav = useNavigate();
  const score = anime.averageScore;
  const scoreColor = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-accent-yellow text-background" : "bg-accent-red";

  return (
    <motion.div
      className="group relative w-40 flex-shrink-0 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onClick={() => nav(`/details/${anime.id}`)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <img src={anime.coverImage.large} alt={anime.title.english || anime.title.romaji} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
        {rank && (
          <span className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            #{rank}
          </span>
        )}
        <span className={`absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${scoreColor}`}>
          {score}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button onClick={(e) => { e.stopPropagation(); nav(`/watch/${anime.id}/1`); }} className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/80">
            <Play className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nav(`/details/${anime.id}`); }} className="rounded-full bg-muted p-2.5 text-foreground hover:bg-muted/80">
            <Info className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-background/90 to-transparent p-2 transition-transform duration-200 group-hover:translate-y-0">
          <p className="text-xs font-semibold text-foreground">{anime.title.english || anime.title.romaji}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{anime.title.english || anime.title.romaji}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">{anime.format}</span>
          {anime.genres.slice(0, 2).map(g => (
            <span key={g} className="text-[10px] text-muted-foreground">{g}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimeCard;
