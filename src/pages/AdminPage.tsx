import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Flag, ShieldBan, RefreshCw, Search, ToggleLeft, ToggleRight, MessageCircle, Sparkles, Camera, UserPlus, Wrench, Lock, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import API_URL from "@/config/api";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const AdminPage = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [loading, setLoading] = useState(true);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteVersion, setNoteVersion] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [u, f, r] = await Promise.all([
            axios.get(`${API_URL}/api/admin/users`),
            axios.get(`${API_URL}/api/admin/features`),
            axios.get(`${API_URL}/api/admin/reports`)
        ]);
        setUsers(u.data);
        setFlags(f.data);
        setReports(r.data);
    } catch (err) {
        console.error("Failed to fetch admin data", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleFlag = async (name: string, current: boolean) => {
    setFlags(prev => prev.map(f => f.name === name ? { ...f, enabled: !current } : f));
    try {
        await axios.put(`${API_URL}/api/admin/features/${name}`, { enabled: !current });
    } catch (err) {
        setFlags(prev => prev.map(f => f.name === name ? { ...f, enabled: current } : f));
    }
  };

  const handleBan = async (uid: string, currentlyBanned: boolean) => {
    try {
        const res = await axios.put(`${API_URL}/api/admin/users/${uid}/ban`, { 
            isBanned: !currentlyBanned, 
            banReason: !currentlyBanned ? "Violation of Terms" : "" 
        });
        setUsers(prev => prev.map(u => u.uid === uid ? res.data : u));
    } catch (err) {
        console.error(err);
    }
  };

  const handlePasswordReset = async (uid: string, email: string) => {
    try {
        await axios.post(`${API_URL}/api/admin/users/${uid}/reset-password`);
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent to " + email);
    } catch (err) {
        console.error(err);
        alert("Failed to send reset email.");
    }
  };

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteVersion || !noteContent) return;
    setPostingNote(true);
    try {
        await axios.post(`${API_URL}/api/release-notes`, {
            title: noteTitle,
            version: noteVersion,
            content: noteContent
        });
        setNoteTitle("");
        setNoteVersion("");
        setNoteContent("");
        alert("Release note posted successfully!");
    } catch (err) {
        console.error(err);
        alert("Failed to post release note.");
    } finally {
        setPostingNote(false);
    }
  };

  const todayStr = new Date().toDateString();
  const todayLogins = users.filter(u => new Date(u.lastLogin).toDateString() === todayStr).length;
  const bannedCount = users.filter(u => u.isBanned).length;

  const statsData = [
    { icon: Users, label: "Total Users", value: users.length, color: "text-primary" },
    { icon: Activity, label: "Today Logins", value: todayLogins, color: "text-secondary" },
    { icon: Flag, label: "Reports", value: reports.length, color: "text-accent-yellow" },
    { icon: ShieldBan, label: "Banned", value: bannedCount, color: "text-accent-red" },
  ];

  const getFeatureIcon = (name: string) => {
    if (name.includes("search")) return Search;
    if (name.includes("chat")) return MessageCircle;
    if (name.includes("comment")) return MessageCircle;
    if (name.includes("ai")) return Sparkles;
    if (name.includes("image")) return Camera;
    if (name.includes("registration")) return UserPlus;
    if (name.includes("maintenance")) return Wrench;
    return Flag;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={fetchData} className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsData.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-4">
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Support Chats */}
        <section className="mb-8 p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Luna Support (AI Handoff)</h2>
                    <p className="text-xs text-muted-foreground">Monitor and take over conversations from Luna AI assistant.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {users.filter(u => u.isSupportNeeded || u.isAdminRequested).map(u => (
                    <div key={u.uid} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} className="h-10 w-10 rounded-full bg-muted" alt="" />
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent-yellow border-2 border-background animate-pulse" />
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{u.displayName || u.username}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Status: {u.isAdminRequested ? 'Admin Needed' : 'In Conversation'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.location.href = `/chat?room=support_${u.uid}`}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <MessageCircle className="h-3.5 w-3.5" /> Take Over
                        </button>
                    </div>
                ))}
                {users.filter(u => u.isSupportNeeded || u.isAdminRequested).length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-border/50 p-8 text-center bg-muted/10">
                        <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
                        <p className="text-sm text-muted-foreground font-medium">No pending support requests.</p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase mt-1 tracking-widest">Luna is managing all users</p>
                    </div>
                )}
            </div>
        </section>
        {/* Post Release Note */}
        <section className="mb-8 p-6 rounded-2xl border border-secondary/20 bg-secondary/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/20">
                    <Flag className="h-5 w-5 text-secondary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Post Release Note</h2>
                    <p className="text-xs text-muted-foreground">Announce new features and updates to all users.</p>
                </div>
            </div>
            <form onSubmit={handlePostNote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Update Title</label>
                        <input 
                            value={noteTitle} 
                            onChange={e => setNoteTitle(e.target.value)} 
                            placeholder="e.g. The Luna Update" 
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-secondary focus:outline-none" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Version</label>
                        <input 
                            value={noteVersion} 
                            onChange={e => setNoteVersion(e.target.value)} 
                            placeholder="e.g. 2.4.0" 
                            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-secondary focus:outline-none" 
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Update Content</label>
                    <textarea 
                        value={noteContent} 
                        onChange={e => setNoteContent(e.target.value)} 
                        placeholder="Detail the changes here..." 
                        rows={4}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-secondary focus:outline-none resize-none" 
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={postingNote || !noteTitle || !noteVersion || !noteContent}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                >
                    {postingNote ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish Update
                </button>
            </form>
        </section>

        {/* User Management */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">User Management</h2>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Search users by email or name..." className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {["User", "Email", "Method", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.email?.toLowerCase().includes(searchUser.toLowerCase()) || u.displayName?.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                  <tr key={u.uid} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{(u.displayName || "U")[0].toUpperCase()}</div>
                      <span className="truncate max-w-[120px] font-medium">{u.displayName || "User"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]">{u.email}</td>
                    <td className="px-4 py-3 text-xs"><span className="rounded bg-muted px-2 py-0.5">{u.googleAuth ? "Google" : "Email"}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${!u.isBanned ? "text-green-500" : "text-accent-red"}`}>{!u.isBanned ? "Active" : "Banned"}</span></td>
                    <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleBan(u.uid, u.isBanned)} className="rounded bg-accent-red/10 px-2 py-1 text-[10px] font-bold text-accent-red hover:bg-accent-red/20 uppercase">
                            {u.isBanned ? "Unban" : "Ban"}
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Flags */}
        <section className="mb-20">
          <h2 className="mb-4 text-lg font-semibold">System Configuration</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {flags.map(f => {
              const Icon = getFeatureIcon(f.name);
              return (
                <div key={f.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${f.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${f.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize">{f.name.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-muted-foreground leading-none mt-1">{f.description}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleFlag(f.name, f.enabled)} className={`transition-colors ${f.enabled ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"}`}>
                    {f.enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
