import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, LogIn } from "lucide-react";

const NotFoundPage = () => {
  const nav = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Floating shapes */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{ width: 20 + i * 15, height: 20 + i * 15, left: `${10 + i * 14}%`, top: `${15 + (i % 3) * 25}%` }}
          animate={{ y: [0, -30, 0], x: [0, i % 2 ? 15 : -15, 0], rotate: [0, 360] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
        <h1 className="text-8xl font-extrabold gradient-text">404</h1>
        <p className="mt-4 text-xl font-medium text-foreground">Page Not Found</p>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => nav("/home")} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">
            <Home className="h-5 w-5" /> Go Home
          </button>
          <button onClick={() => nav("/auth")} className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-2.5 font-semibold text-foreground hover:bg-muted">
            <LogIn className="h-5 w-5" /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
