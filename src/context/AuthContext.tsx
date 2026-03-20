import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/types";

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

const mockUser: User = {
  uid: "123",
  email: "test@test.com",
  displayName: "TestUser",
  photoURL: "",
  isAdmin: false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  const login = useCallback(async (_email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 500));
    setUser(mockUser);
  }, []);

  const signup = useCallback(async (_email: string, _password: string, userData: Partial<User>) => {
    await new Promise(r => setTimeout(r, 500));
    setUser({ ...mockUser, ...userData });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise(r => setTimeout(r, 500));
    setUser(mockUser);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
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
