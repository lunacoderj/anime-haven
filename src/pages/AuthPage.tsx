import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

const AuthPage = () => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { login, signup, loginWithGoogle } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required"); return; }
    try { await login(email, password); nav("/home"); } catch { setError("Login failed"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPw) { setError("Passwords do not match"); return; }
    try { await signup(email, password, { displayName: username }); nav("/home"); } catch { setError("Signup failed"); }
  };

  const handleGoogle = async () => {
    try { await loginWithGoogle(); nav("/home"); } catch { setError("Google login failed"); }
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="mb-6 text-center text-2xl font-bold gradient-text">AnimeWorld</h1>

        {/* Tab switcher */}
        <div className="relative mb-6 flex rounded-lg bg-muted p-1">
          <motion.div layout className="absolute inset-y-1 rounded-md bg-primary" style={{ width: "50%", left: tab === "login" ? "4px" : "calc(50% - 4px)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          <button onClick={() => { setTab("login"); setError(""); }} className={`relative z-10 flex-1 rounded-md py-2 text-sm font-medium ${tab === "login" ? "text-primary-foreground" : "text-muted-foreground"}`}>Login</button>
          <button onClick={() => { setTab("signup"); setError(""); }} className={`relative z-10 flex-1 rounded-md py-2 text-sm font-medium ${tab === "signup" ? "text-primary-foreground" : "text-muted-foreground"}`}>Sign Up</button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</p>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
            <button type="submit" className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">Login</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
              <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            </div>
            <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
            <div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} /></div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
            </div>
            <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="password" placeholder="Confirm password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={inputCls} /></div>
            <button type="submit" className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/80">Sign Up</button>
          </form>
        )}

        <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or</span><div className="h-px flex-1 bg-border" /></div>
        <button onClick={handleGoogle} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
};

export default AuthPage;
