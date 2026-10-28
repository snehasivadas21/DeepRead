
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GitHubCallbackPage() {
  const router = useRouter();
  const { setAccessToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");

    if (!token) {
      setError("GitHub authentication failed. Please try again.");
      return;
    }

    // Remove the token from the visible URL.
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    setAccessToken(token);
    router.replace("/dashboard");
  }, [setAccessToken, router]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p>{error}</p>
        <button onClick={() => router.replace("/login")}>
          Back to login
        </button>
      </div>
    );
  }

  return <div className="p-8 text-center">Signing you in...</div>;
}
