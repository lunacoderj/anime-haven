import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { Manga } from "@/types";

interface Props {
  manga: Manga;
  rank?: number;
}

const countryLabel: Record<string, string> = { JP: "Manga", KR: "Manhwa", CN: "Manhua" };

const MangaCard = ({ manga, rank }: Props) => {
  const nav = useNavigate();
  const score = manga.averageScore;
  const scoreColor = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-accent-yellow text-background" : "bg-accent-red";

  return (
    <motion.div
      className="group relative w-40 flex-shrink-0 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onClick={() => nav(`/details/${manga.id}`)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <img src={manga.coverImage.large} alt={manga.title.english || manga.title.romaji} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
        {rank && (
          <span className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">#{rank}</span>
        )}
        <span className={`absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${scoreColor}`}>{score}%</span>
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{manga.title.english || manga.title.romaji}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-secondary">{countryLabel[manga.countryOfOrigin] || manga.format}</span>
          <span className="text-[10px] text-muted-foreground">{manga.chapters} ch</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MangaCard;
