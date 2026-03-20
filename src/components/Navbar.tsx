import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, SlidersHorizontal, Camera, Sparkles, Bell, Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import GenreFilter from "./GenreFilter";

const Navbar = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) nav(`/home?q=${search}`);
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="text-xl font-bold gradient-text">AnimeWorld</Link>

          {/* Desktop center */}
          <div className="hidden items-center gap-2 md:flex">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search anime..."
                className="h-9 w-64 rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
            <button onClick={() => setShowFilter(f => !f)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            <button onClick={() => setShowMenu(m => !m)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Camera className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop right */}
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

          {/* Mobile hamburger */}
          <button onClick={() => setShowMobileNav(n => !n)} className="rounded-lg p-2 text-foreground md:hidden">
            {showMobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {showMobileNav && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border md:hidden">
              <div className="flex flex-col gap-2 p-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anime..." className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
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

      {/* Genre filter dropdown */}
      <AnimatePresence>
        {showFilter && <GenreFilter onClose={() => setShowFilter(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
