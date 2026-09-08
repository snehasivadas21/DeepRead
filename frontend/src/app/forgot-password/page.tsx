"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest(
        `/auth/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      setMessage(data.message || "Password reset email sent.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-2 text-2xl font-bold">
          Forgot Password
        </h1>

        <p className="mb-6 text-gray-600">
          Enter your email and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black p-3 text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}