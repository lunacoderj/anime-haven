import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Edit, Heart, BookOpen, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("activity");
  const tabs = ["Activity", "Watchlist", "Favorites"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40" />

        <div className="mx-auto max-w-4xl px-4 md:px-8">
          {/* Profile header */}
          <div className="-mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end md:gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground shadow-xl">
              {user?.displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="mt-4 flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground">{user?.displayName || "User"}</h1>
              <p className="text-sm text-muted-foreground">@{user?.displayName?.toLowerCase() || "user"}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground md:justify-start">
                <Calendar className="h-3 w-3" /> Joined March 2024
              </p>
            </div>
            <button className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted md:mt-0">
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: Tv, label: "Anime Watched", value: "142" },
              { icon: BookOpen, label: "Manga Reading", value: "38" },
              { icon: Heart, label: "Favorites", value: "67" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-border">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === t.toLowerCase() ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "activity" && (
              <div className="space-y-4">
                {["Watched Episode 12 of Demon Slayer", "Added Jujutsu Kaisen to watchlist", "Rated One Piece ★★★★★"].map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="h-12 w-9 rounded bg-muted" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{a}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {activeTab === "watchlist" && (
              <div className="flex flex-col items-center gap-3 py-12">
                <Tv className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Your watchlist will appear here</p>
              </div>
            )}
            {activeTab === "favorites" && (
              <div className="flex flex-col items-center gap-3 py-12">
                <Heart className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Your favorites will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
