import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, BookOpen, MessageCircle, Sparkles, TrendingUp, Users, Star } from "lucide-react";

const features = [
  { icon: TrendingUp, title: "Discover", desc: "Find trending anime and manga curated for you" },
  { icon: BookOpen, title: "Track", desc: "Keep track of what you watch and read" },
  { icon: MessageCircle, title: "Chat", desc: "Connect with fellow anime enthusiasts" },
  { icon: Sparkles, title: "AI Assistant", desc: "Get personalized recommendations with AI" },
];

const stats = [
  { value: "10K+", label: "Anime" },
  { value: "50K+", label: "Users" },
  { value: "100K+", label: "Reviews" },
];

const LandingPage = () => {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        {/* Floating cards */}
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            className="absolute h-32 w-24 rounded-lg bg-card/30 backdrop-blur-sm"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, i % 2 ? 5 : -5, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
          <h1 className="mb-4 text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
            Discover Your Next<br /><span className="gradient-text">Anime</span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
            Your ultimate destination for anime and manga discovery. Track, chat, and explore with our AI-powered platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => nav("/auth")} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-lg glow-primary transition-transform hover:scale-105">
              <Play className="h-5 w-5" /> Get Started
            </button>
            <button onClick={() => nav("/home")} className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-3.5 font-semibold text-foreground backdrop-blur transition-transform hover:scale-105 hover:bg-card">
              Browse Anime
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Everything You Need</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6 text-center transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-12 px-4">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © 2024 AnimeWorld. Built with ❤️ for anime fans.
      </footer>
    </div>
  );
};

export default LandingPage;
