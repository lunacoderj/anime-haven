import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, Star, Calendar, Clock, Tv, Film } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getMediaDetails, getRecommendations } from "@/utils/anilist";
import type { Anime } from "@/types";

const DetailsPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [recs, setRecs] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const numId = Number(id);
    Promise.all([getMediaDetails(numId), getRecommendations(numId)])
      .then(([a, r]) => { setAnime(a); setRecs(r); setLoading(false); });
  }, [id]);

  const tabs = ["Overview", "Characters", "Staff", "Recommendations"];

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16"><div className="h-80 animate-pulse bg-muted" /><div className="mx-auto max-w-6xl p-8"><div className="h-8 w-64 animate-pulse rounded bg-muted" /></div></div>
    </div>
  );

  if (!anime) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Banner */}
        <div className="relative h-80 overflow-hidden">
          <img src={anime.bannerImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="-mt-32 relative z-10 flex flex-col gap-6 md:flex-row">
            {/* Poster */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
              <div className="relative w-48 overflow-hidden rounded-xl shadow-2xl">
                <img src={anime.coverImage.extraLarge} alt={anime.title.english} className="w-full" />
                <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{anime.format}</span>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 pt-4 md:pt-20">
              <h1 className="text-3xl font-bold text-foreground">{anime.title.english || anime.title.romaji}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{anime.title.native}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-accent-yellow"><Star className="h-4 w-4 fill-current" /> {(anime.averageScore / 10).toFixed(1)}</span>
                <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{anime.format}</span>
                <span className="rounded bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">{anime.status}</span>
                <span className="text-sm text-muted-foreground">{anime.episodes} Episodes</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {anime.genres.map(g => <span key={g} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">{g}</span>)}
              </div>

              <button onClick={() => nav(`/watch/${anime.id}/1`)} className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">
                <Play className="h-5 w-5" /> Watch Now
              </button>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-border">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === t.toLowerCase() ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Synopsis</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: anime.description }} />
                </div>
                {anime.trailer && (
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Trailer</h3>
                    <div className="aspect-video overflow-hidden rounded-xl">
                      <iframe src={`https://www.youtube.com/embed/${anime.trailer.id}`} className="h-full w-full" allowFullScreen title="Trailer" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: Calendar, label: "Season", value: `${anime.season} ${anime.seasonYear}` },
                    { icon: Tv, label: "Episodes", value: String(anime.episodes) },
                    { icon: Clock, label: "Duration", value: `${anime.duration} min` },
                    { icon: Film, label: "Studio", value: anime.studios.nodes[0]?.name || "N/A" },
                  ].map(i => (
                    <div key={i.label} className="rounded-lg border border-border bg-card p-4">
                      <i.icon className="mb-2 h-5 w-5 text-primary" />
                      <p className="text-xs text-muted-foreground">{i.label}</p>
                      <p className="font-semibold text-foreground">{i.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "characters" && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {["Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Giyu", "Shinobu"].map(c => (
                  <div key={c} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div><p className="text-sm font-medium text-foreground">{c}</p><p className="text-xs text-muted-foreground">Main Character</p></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "staff" && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {["Director", "Producer", "Writer", "Animator"].map(r => (
                  <div key={r} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div><p className="text-sm font-medium text-foreground">Staff Member</p><p className="text-xs text-muted-foreground">{r}</p></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {recs.map(r => <AnimeCard key={r.id} anime={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
