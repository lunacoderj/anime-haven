import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, Star, Calendar, Clock, Tv, Film, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getMediaDetails } from "@/utils/anilist";
import type { Anime } from "@/types";

const DetailsPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = () => {
    setLoading(true);
    setError(false);
    getMediaDetails(Number(id))
      .then(d => { if (d) { setMedia(d); setLoading(false); } else { setError(true); setLoading(false); } })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [id]);

  const tabs = ["Overview", "Characters", "Staff", "Recommendations"];

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16"><div className="h-80 animate-pulse bg-muted" /><div className="mx-auto max-w-6xl p-8"><div className="h-8 w-64 animate-pulse rounded bg-muted" /></div></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-40 text-center">
        <p className="mb-4 text-lg text-muted-foreground">Failed to load details</p>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    </div>
  );

  if (!media) return null;

  const isAnime = media.type === "ANIME" || media.episodes;
  const title = media.title?.english || media.title?.romaji || media.title?.userPreferred || "";
  const characters = media.characters?.edges ?? [];
  const staff = media.staff?.edges ?? [];
  const recs = (media.recommendations?.edges ?? []).map((e: any) => e.node?.mediaRecommendation).filter(Boolean);
  const mainStudios = (media.studios?.edges ?? []).filter((e: any) => e.isMain).map((e: any) => e.node);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="relative h-80 overflow-hidden">
          {media.bannerImage ? (
            <img src={media.bannerImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="-mt-32 relative z-10 flex flex-col gap-6 md:flex-row">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0">
              <div className="relative w-48 overflow-hidden rounded-xl shadow-2xl">
                <img src={media.coverImage?.extraLarge || media.coverImage?.large} alt={title} className="w-full" />
                <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{media.format}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 pt-4 md:pt-20">
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {media.title?.native && <p className="mt-1 text-sm text-muted-foreground">{media.title.native}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {media.averageScore && <span className="flex items-center gap-1 text-accent-yellow"><Star className="h-4 w-4 fill-current" /> {(media.averageScore / 10).toFixed(1)}</span>}
                <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{media.format}</span>
                <span className="rounded bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">{media.status}</span>
                {isAnime && media.episodes && <span className="text-sm text-muted-foreground">{media.episodes} Episodes</span>}
                {!isAnime && media.chapters && <span className="text-sm text-muted-foreground">{media.chapters} Chapters</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(media.genres ?? []).map((g: string) => <span key={g} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">{g}</span>)}
              </div>

              <button
                onClick={() => nav(isAnime ? `/watch/${media.id}/1` : `/read/${media.id}/1`)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80"
              >
                {isAnime ? <><Play className="h-5 w-5" /> Watch Now</> : <><BookOpen className="h-5 w-5" /> Read Now</>}
              </button>
            </motion.div>
          </div>

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
                  <p className="text-sm leading-relaxed text-muted-foreground">{media.description || "No synopsis available."}</p>
                </div>
                {media.trailer?.site === "youtube" && media.trailer?.id && (
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Trailer</h3>
                    <div className="aspect-video overflow-hidden rounded-xl">
                      <iframe src={`https://www.youtube.com/embed/${media.trailer.id}`} className="h-full w-full" allowFullScreen title="Trailer" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { icon: Calendar, label: "Season", value: media.season && media.seasonYear ? `${media.season} ${media.seasonYear}` : media.startDate?.year ? String(media.startDate.year) : "N/A" },
                    { icon: Tv, label: isAnime ? "Episodes" : "Chapters", value: String(isAnime ? media.episodes ?? "N/A" : media.chapters ?? "N/A") },
                    { icon: Clock, label: "Duration", value: media.duration ? `${media.duration} min` : "N/A" },
                    { icon: Film, label: "Studio", value: mainStudios[0]?.name || "N/A" },
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {characters.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-10">No character data available.</p>
                ) : characters.map((c: any) => (
                  <div key={c.node?.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    {c.node?.image?.large ? (
                      <img src={c.node.image.large} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.node?.name?.full}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                      {c.voiceActors?.[0] && <p className="truncate text-xs text-primary">VA: {c.voiceActors[0].name?.full}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "staff" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {staff.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-10">No staff data available.</p>
                ) : staff.map((s: any) => (
                  <div key={s.node?.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    {s.node?.image?.large ? (
                      <img src={s.node.image.large} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{s.node?.name?.full}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {recs.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground py-10">No recommendations available.</p>
                ) : recs.map((r: any) => <AnimeCard key={r.id} anime={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsPage;
