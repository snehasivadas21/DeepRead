"use client";

import {createContext,useContext,useEffect,useState,ReactNode,} from "react";

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [accessToken, setAccessTokenState] =
    useState<string | null>(null);

  function setAccessToken(token: string) {
    setAccessTokenState(token);
  }

  function clearAccessToken() {
    setAccessTokenState(null);
  }

  useEffect(() => {
    async function refreshAccessToken() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setAccessTokenState(data.access_token);
      } catch (error) {
        console.error("Failed to refresh access token:", error);
      }
    }

    refreshAccessToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        clearAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}