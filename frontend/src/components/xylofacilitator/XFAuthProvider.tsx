"use client";

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { siweChallenge, siweVerify, getSession, type Developer } from "@/lib/xylofacilitator";

// Auth Context
interface AuthState {
  token: string | null;
  developer: Developer | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  developer: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function useXFAuth() {
  return useContext(AuthContext);
}

const TOKEN_KEY = "xf_token";

export function XFAuthProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      getSession(stored)
        .then(({ developer: dev }) => {
          setToken(stored);
          setDeveloper(dev as Developer);
        })
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { message } = await siweChallenge(address);
      const signature = await signMessageAsync({ message });
      const { token: newToken, developer: dev } = await siweVerify(message, signature);
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setDeveloper(dev as Developer);
    } catch (err: any) {
      console.error("SIWE sign-in failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync]);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setDeveloper(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, developer, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
