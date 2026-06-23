import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";
import ReactPlayer from "react-player";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";
import { useHistory } from "@/hooks/useHistory";
import { useAuth } from "@/context/AuthContext";
import { getMediaDetails } from "@/utils/anilist";
import { searchStreamingAnime, getStreamingEpisodes, getStreamingLinks, StreamingSource } from "@/utils/streaming";

const WatchPage = () => {
  const { id, episode } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { addToHistory } = useHistory(user?.uid || null);

  const epNum = Number(episode) || 1;
  const [totalEps, setTotalEps] = useState(0);
  const [animeDetails, setAnimeDetails] = useState<any>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [currentSource, setCurrentSource] = useState<StreamingSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Load AniList Details
  useEffect(() => {
    getMediaDetails(Number(id)).then(data => {
      if (data) {
        setAnimeDetails(data);
        setTotalEps(data.episodes || 0);
        const title = data.title?.english || data.title?.romaji || "";
        const coverImage = data.coverImage?.extraLarge || data.coverImage?.large || "";
        addToHistory({ mediaId: Number(id), mediaType: "ANIME", title, coverImage, episodeOrChapter: epNum });
      }
    });
  }, [id]);

  // 2. Map AniList to Streaming ID (Search for matching anime)
  useEffect(() => {
    if (animeDetails && !streamingId) {
      const searchTitle = (animeDetails.title.english || animeDetails.title.romaji)
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      searchStreamingAnime(searchTitle).then(results => {
        if (results && results.length > 0) {
          // Find the best match (first result)
          setStreamingId(results[0].id);
        } else {
          setError("Could not find streaming source for this anime.");
          setLoading(false);
        }
      });
    }
  }, [animeDetails, streamingId]);

  // 3. Get Episode List & Streaming Links
  useEffect(() => {
    if (streamingId) {
      setLoading(true);
      getStreamingEpisodes(streamingId).then(episodes => {
        if (episodes && episodes.length > 0) {
          const episode = episodes.find(e => e.number === epNum) || episodes[0];
          getStreamingLinks(episode.id).then(data => {
            if (data && data.sources && data.sources.length > 0) {
              setSources(data.sources);
              // Prefer 1080p, then 720p
              const bestSource = data.sources.find(s => s.quality === "1080p") || 
                               data.sources.find(s => s.quality === "720p") || 
                               data.sources.find(s => s.quality === "default") || 
                               data.sources[0];
              setCurrentSource(bestSource);
              setError(null);
            } else {
              setError("Failed to load video sources for this episode.");
            }
            setLoading(false);
          });
        } else {
          setError("Could not find any episodes for this anime.");
          setLoading(false);
        }
      });
    }
  }, [streamingId, epNum]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-20 md:px-8">
        {/* Player Container */}
        <div className="group relative mb-6 aspect-video overflow-hidden rounded-xl border border-border bg-black shadow-2xl">
          {loading ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-card">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Fetching Episode {epNum} Sources...</p>
            </div>
          ) : error ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-card">
              <p className="text-lg font-semibold text-destructive">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
            </div>
          ) : (
            <ReactPlayer
              url={currentSource?.url}
              controls
              width="100%"
              height="100%"
              playing
              config={{
                file: {
                  attributes: {
                    crossOrigin: "anonymous",
                  }
                }
              }}
            />
          )}
        </div>

        {/* Quality Selector */}
        {!loading && sources.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Quality</span>
            {sources.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSource(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  currentSource?.quality === s.quality
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s.quality}
              </button>
            ))}
          </div>
        )}

        {/* Nav Controls & Episode Grid */}
        <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-card/50 p-6 backdrop-blur-sm border border-border/50 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
               <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                 <Play className="h-6 w-6 fill-current" />
               </div>
               <div className="min-w-0">
                 <h2 className="truncate text-xl font-bold text-foreground">
                   {animeDetails?.title?.english || animeDetails?.title?.romaji || "Loading..."}
                 </h2>
                 <p className="text-sm font-medium text-muted-foreground">Currently Watching: Episode {epNum}</p>
               </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 bg-background/50 rounded-full p-1.5 border border-border">
              <button 
                onClick={() => epNum > 1 && nav(`/watch/${id}/${epNum - 1}`)} 
                disabled={epNum <= 1} 
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-muted disabled:hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[4rem] text-center text-sm font-bold">
                {epNum} / {totalEps || "???"}
              </span>
              <button 
                onClick={() => epNum < totalEps && nav(`/watch/${id}/${epNum + 1}`)} 
                disabled={totalEps > 0 && epNum >= totalEps} 
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-muted disabled:hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Episode Grid */}
          <div>
            <h3 className="mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Episode Selection</h3>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {Array.from({ length: totalEps || 0 }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => nav(`/watch/${id}/${i + 1}`)} 
                  className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                    i + 1 === epNum 
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "border-border bg-background/50 text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CommentSection mediaId={Number(id)} mediaType="ANIME" />
      </div>
    </div>
  );
};

export default WatchPage;
