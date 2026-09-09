"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      setError("Google login failed. Access token not found.");
      return;
    }

    localStorage.setItem("access_token", accessToken);

    router.replace("/dashboard");
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">
        Completing Google login...
      </p>
    </main>
  );
}
