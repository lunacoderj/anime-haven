import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, SlidersHorizontal, Camera, Sparkles, Bell, Menu, X, LogOut, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { searchAnime } from "@/utils/anilist";
import GenreFilter from "./GenreFilter";
import type { Anime } from "@/types";

const Navbar = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
    setIsSearching(true);
    setShowResults(true);
    const results = await searchAnime(q);
    setSearchResults(results);
    setIsSearching(false);
  }, []);

  const onSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") { setShowResults(false); setShowDropdown(false); } };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { doSearch(search); }
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="text-xl font-bold gradient-text">AnimeWorld</Link>

          <div className="hidden items-center gap-2 md:flex">
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => onSearchChange(e.target.value)}
                  onFocus={() => { if (searchResults.length) setShowResults(true); }}
                  placeholder="Search anime..."
                  className="h-9 w-64 rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </form>
              <AnimatePresence>
                {showResults && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute left-0 top-12 w-80 rounded-lg border border-border bg-card shadow-xl overflow-hidden z-50">
                    {isSearching ? (
                      <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">No results found</p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map(r => (
                          <button
                            key={r.id}
                            onClick={() => { nav(`/details/${r.id}`); setShowResults(false); setSearch(""); }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors"
                          >
                            <img src={r.coverImage?.large || r.coverImage?.extraLarge} alt="" className="h-12 w-9 rounded object-cover flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{r.title?.english || r.title?.romaji}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {r.format && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">{r.format}</span>}
                                {r.averageScore && <span className="text-[10px] text-muted-foreground">★ {(r.averageScore / 10).toFixed(1)}</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setShowFilter(f => !f)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button onClick={() => setShowMenu(m => !m)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Camera className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => setShowMenu(m => !m)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Sparkles className="h-5 w-5" />
            </button>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-red" />
            </button>
            <div className="relative" ref={dropRef}>
              <button onClick={() => setShowDropdown(d => !d)} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute right-0 top-12 w-48 rounded-lg border border-border bg-card p-1 shadow-xl">
                    <button onClick={() => { nav("/profile"); setShowDropdown(false); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted">
                      <User className="h-4 w-4" /> Profile
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button onClick={() => { logout(); nav("/auth"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-accent-red hover:bg-muted">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button onClick={() => setShowMobileNav(n => !n)} className="rounded-lg p-2 text-foreground md:hidden">
            {showMobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {showMobileNav && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border md:hidden">
              <div className="flex flex-col gap-2 p-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search anime..." className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </form>
                <Link to="/home" onClick={() => setShowMobileNav(false)} className="rounded-md px-3 py-2 text-foreground hover:bg-muted">Home</Link>
                <Link to="/chat" onClick={() => setShowMobileNav(false)} className="rounded-md px-3 py-2 text-foreground hover:bg-muted">Chat</Link>
                <Link to="/profile" onClick={() => setShowMobileNav(false)} className="rounded-md px-3 py-2 text-foreground hover:bg-muted">Profile</Link>
                <button onClick={() => { logout(); nav("/auth"); }} className="rounded-md px-3 py-2 text-left text-accent-red hover:bg-muted">Logout</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showFilter && <GenreFilter onClose={() => setShowFilter(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
