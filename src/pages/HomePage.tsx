import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import AnimeCard from "@/components/AnimeCard";
import MangaCard from "@/components/MangaCard";
import SkeletonCard from "@/components/SkeletonCard";
import { getTrendingAnime, getTrendingManga, getRecentAnime, getRecentManga } from "@/utils/anilist";
import type { Anime, Manga } from "@/types";

const ScrollRow = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section className="px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="rounded-full bg-muted p-1.5 text-foreground hover:bg-muted/80"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => scroll(1)} className="rounded-full bg-muted p-1.5 text-foreground hover:bg-muted/80"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>{children}</div>
    </section>
  );
};

const HomePage = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [recentAnime, setRecentAnime] = useState<Anime[]>([]);
  const [recentManga, setRecentManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrendingAnime(), getTrendingManga(), getRecentAnime(), getRecentManga()])
      .then(([ta, tm, ra, rm]) => { setTrendingAnime(ta); setTrendingManga(tm); setRecentAnime(ra); setRecentManga(rm); })
      .finally(() => setLoading(false));
  }, []);

  const skeletons = Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {loading ? (
          <div className="h-[70vh] animate-pulse bg-muted" />
        ) : (
          <HeroCarousel items={trendingAnime.slice(0, 10)} />
        )}

        <ScrollRow title="🔥 Trending Anime">
          {loading ? skeletons : trendingAnime.map((a, i) => <AnimeCard key={a.id} anime={a} rank={i + 1} />)}
        </ScrollRow>

        <ScrollRow title="📚 Trending Manga">
          {loading ? skeletons : trendingManga.map((m, i) => <MangaCard key={m.id} manga={m} rank={i + 1} />)}
        </ScrollRow>

        <section className="px-4 py-6 md:px-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">⚡ Recent Anime</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {loading ? skeletons : recentAnime.map(a => <AnimeCard key={a.id} anime={a} />)}
          </div>
        </section>

        <section className="px-4 py-6 md:px-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">📖 Recent Manga</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
            {loading ? skeletons : recentManga.map(m => <MangaCard key={m.id} manga={m} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
