"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/services/api";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setMessage("");
      setError("Verification token is missing.");
      return;
    }

    async function verifyEmail() {
      try {
        const data = await apiRequest(
          `/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        setMessage(data.message || "Email verified successfully!");

        setTimeout(()=>{
          router.push("/login");
        },1500)
      } catch (err) {
        setMessage("");
        setError(
          err instanceof Error
            ? err.message
            : "Email verification failed."
        );
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8 text-center">
        {message && (
          <p className="text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}