import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Edit, Heart, BookOpen, Tv, Save, CheckCircle, Camera, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useHistory } from "@/hooks/useHistory";
import axios from "axios";
import API_URL from "@/config/api";

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("activity");
  const tabs = ["Activity", "Watchlist", "Favorites", "Edit Profile"];
  const [dbUser, setDbUser] = useState<any>(null);
  const { bookmarks } = useBookmarks(user?.uid || null);
  const { history } = useHistory(user?.uid || null);

  const [editForm, setEditForm] = useState({ displayName: "", username: "", bio: "" });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.uid) {
      axios.get(`${API_URL}/api/users/${user.uid}`).then(res => {
        setDbUser(res.data);
        setEditForm({
          displayName: res.data.displayName || user.displayName || "",
          username: res.data.username || "",
          bio: res.data.bio || ""
        });
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    try {
      const res = await axios.put(`${API_URL}/api/users/${user.uid}`, editForm);
      setDbUser(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const res = await axios.post(
        `${API_URL}/api/users/${user.uid}/avatar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setDbUser((prev: any) => ({ 
        ...prev, 
        photoURL: res.data.photoURL 
      }));
      
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const watchingCount = bookmarks.filter(b => b.status === "watching").length;
  const completedCount = bookmarks.filter(b => b.status === "completed").length;
  const totalBookmarked = bookmarks.length;

  const joinDate = dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="relative h-48 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40" />

        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="-mt-16 relative z-10 flex flex-col items-center md:flex-row md:items-end md:gap-6">
            <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
                {dbUser?.photoURL || user?.photoURL ? (
                    <img 
                      src={dbUser?.photoURL || user?.photoURL} 
                      alt="Profile" 
                      className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-xl bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`;
                      }}
                    />
                ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground shadow-xl">
                    {(dbUser?.displayName || user?.displayName)?.[0]?.toUpperCase() || "U"}
                    </div>
                )}
                <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                />
            </div>
            
            <div className="mt-4 flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground">{dbUser?.displayName || user?.displayName || "User"}</h1>
              <p className="text-sm text-muted-foreground">@{dbUser?.username || "user"}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground md:justify-start">
                <Calendar className="h-3 w-3" /> Joined {joinDate}
              </p>
              {dbUser?.bio && <p className="mt-2 text-sm text-foreground">{dbUser.bio}</p>}
            </div>
            <button onClick={() => setActiveTab("edit profile")} className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted md:mt-0">
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: Tv, label: "Watching", value: watchingCount },
              { icon: BookOpen, label: "Completed", value: completedCount },
              { icon: Heart, label: "Bookmarked", value: totalBookmarked },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-1 border-b border-border overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${activeTab === t.toLowerCase() ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "activity" && (
              <div className="space-y-4">
                {history.length === 0 ? (
                    <p className="text-center text-muted-foreground">No history yet.</p>
                ) : history.map((h, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    {h.coverImage ? <img src={h.coverImage} className="h-12 w-9 rounded object-cover bg-muted" alt="" /> : <div className="h-12 w-9 rounded bg-muted" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {h.mediaType === "ANIME" ? "Watched Episode" : "Read Chapter"} {h.episodeOrChapter} of {h.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(h.watchedAt).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "watchlist" && (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {bookmarks.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground">Your watchlist is empty.</p>
                ) : bookmarks.map(b => (
                    <div key={b.mediaId} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card">
                        <img src={b.coverImage} alt={b.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-xs font-bold text-foreground">{b.title}</p>
                          <p className="text-[10px] text-primary">{b.status}</p>
                        </div>
                    </div>
                ))}
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="flex flex-col items-center gap-3 py-12">
                <Heart className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Favorites feature coming soon</p>
              </div>
            )}

            {activeTab === "edit profile" && (
                <div className="max-w-md space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground">Display Name</label>
                        <input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="mt-1 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Username</label>
                        <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="mt-1 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground">Bio</label>
                        <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} className="mt-1 w-full rounded-lg border border-border bg-muted/50 p-2.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                    </div>
                    <button onClick={handleSaveProfile} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                        <Save className="h-4 w-4" /> Save Profile
                    </button>
                    {saveSuccess && <p className="flex items-center gap-1 text-sm text-green-500"><CheckCircle className="h-4 w-4" /> Profile saved successfully!</p>}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
