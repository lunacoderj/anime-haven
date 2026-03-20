import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { searchWithFilters, type SearchFilters } from "@/utils/anilist";
import type { Anime } from "@/types";

const SearchResultsPage = () => {
  const [params] = useSearchParams();
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filters: SearchFilters = {};
    const genres = params.get("genres");
    if (genres) filters.genres = genres.split(",");
    if (params.get("status")) filters.status = params.get("status")!;
    if (params.get("year")) filters.year = Number(params.get("year"));
    if (params.get("type")) filters.type = params.get("type")!;
    if (params.get("sort")) filters.sort = params.get("sort")!;

    setLoading(true);
    searchWithFilters(filters).then(r => { setResults(r); setLoading(false); });
  }, [params]);

  const skeletons = Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-24 md:px-8">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-2xl font-bold text-foreground">
          Search Results {!loading && `(${results.length} found)`}
        </motion.h1>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {loading ? skeletons : results.length === 0 ? (
            <p className="col-span-full py-20 text-center text-muted-foreground">No results found. Try adjusting your filters.</p>
          ) : results.map(a => <AnimeCard key={a.id} anime={a} />)}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
