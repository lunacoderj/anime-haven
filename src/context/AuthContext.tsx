import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import type { User } from "@/types";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "admin@animeworld.com").split(",").map((e: string) => e.trim().toLowerCase());

const firebaseToUser = (u: FirebaseUser, extra?: any): User => ({
  uid: u.uid,
  email: u.email || "",
  displayName: u.displayName || "",
  username: extra?.username || u.displayName?.replace(/\s+/g, '').toLowerCase() || u.email?.split('@')[0],
  photoURL: u.photoURL || "",
  isAdmin: ADMIN_EMAILS.includes((u.email || "").toLowerCase()),
});

const saveUserToBackend = async (u: FirebaseUser, extra?: Record<string, unknown>) => {
  try {
    await axios.post(`${API}/api/users`, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      googleAuth: u.providerData.some(p => p.providerId === "google.com"),
      phoneAuth: u.providerData.some(p => p.providerId === "phone"),
      ...extra,
    });
  } catch {
    // Backend may not be running — don't block auth
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const res = await axios.get(`${API}/api/users/${fbUser.uid}`);
          setUser(firebaseToUser(fbUser, res.data));
        } catch {
          setUser(firebaseToUser(fbUser));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToBackend(cred.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (userData.displayName) {
      await updateProfile(cred.user, { displayName: userData.displayName });
    }
    await saveUserToBackend(cred.user, userData as Record<string, unknown>);
    // Re-read user after profile update
    setUser(firebaseToUser(cred.user));
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await saveUserToBackend(cred.user);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, isAdmin: user?.isAdmin ?? false, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
