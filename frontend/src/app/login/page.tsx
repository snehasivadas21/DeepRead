"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/services/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Login response:", data);

      setMessage("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-black"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black p-3 text-white"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600">{message}</p>
        )}

        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
}