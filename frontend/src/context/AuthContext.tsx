"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  accessToken: string | null;
  isAuthLoading: boolean;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let refreshPromise: Promise<string | null> | null = null;

function refreshOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => (res.ok ? (await res.json()).access_token : null))
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    refreshOnce().then((token) => {
      setAccessTokenState(token);
      setIsAuthLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthLoading,
        setAccessToken: setAccessTokenState,
        clearAccessToken: () => setAccessTokenState(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}