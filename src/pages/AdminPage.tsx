import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Flag, ShieldBan, RefreshCw, Search, ToggleLeft, ToggleRight, MessageCircle, Sparkles, Camera, UserPlus, Wrench, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";

const statsData = [
  { icon: Users, label: "Total Users", value: "2,847", color: "text-primary" },
  { icon: Activity, label: "Today Logins", value: "342", color: "text-secondary" },
  { icon: Flag, label: "Reports", value: "12", color: "text-accent-yellow" },
  { icon: ShieldBan, label: "Banned", value: "5", color: "text-accent-red" },
];

const featureFlags = [
  { id: "search", name: "Search", desc: "Enable search functionality", icon: Search, default: true },
  { id: "chat", name: "Chat", desc: "Enable chat rooms", icon: MessageCircle, default: true },
  { id: "comments", name: "Comments", desc: "Enable comments on media", icon: MessageCircle, default: true },
  { id: "ai", name: "AI Assistant", desc: "Enable AI assistant", icon: Sparkles, default: true },
  { id: "image", name: "Image Analyzer", desc: "Enable image analysis", icon: Camera, default: false },
  { id: "registration", name: "New Registrations", desc: "Allow new signups", icon: UserPlus, default: true },
  { id: "maintenance", name: "Maintenance Mode", desc: "Enable maintenance mode", icon: Wrench, default: false },
];

const AdminPage = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>(Object.fromEntries(featureFlags.map(f => [f.id, f.default])));
  const [searchUser, setSearchUser] = useState("");

  const toggleFlag = (id: string) => setFlags(f => ({ ...f, [id]: !f[id] }));

  const mockUsers = [
    { name: "John Doe", email: "john@email.com", method: "Email", joined: "2024-01-15", lastLogin: "2024-03-20", status: "Active" },
    { name: "Jane Smith", email: "jane@email.com", method: "Google", joined: "2024-02-20", lastLogin: "2024-03-19", status: "Active" },
    { name: "Bob Wilson", email: "bob@email.com", method: "Email", joined: "2024-03-01", lastLogin: "2024-03-18", status: "Banned" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <button className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsData.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border bg-card p-4">
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* User Management */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">User Management</h2>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Search users..." className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {["User", "Email", "Method", "Joined", "Last Login", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockUsers.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                  <tr key={u.email} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="flex items-center gap-2 px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{u.name[0]}</div>
                      <span className="text-foreground">{u.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">{u.method}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${u.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-accent-red/20 text-accent-red"}`}>{u.status}</span></td>
                    <td className="px-4 py-3">
                      <button className="rounded bg-accent-red/20 px-2 py-1 text-xs text-accent-red hover:bg-accent-red/30">{u.status === "Active" ? "Ban" : "Unban"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Flags */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Feature Flags</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureFlags.map(f => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <f.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggleFlag(f.id)} className={flags[f.id] ? "text-primary" : "text-muted-foreground"}>
                  {flags[f.id] ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
