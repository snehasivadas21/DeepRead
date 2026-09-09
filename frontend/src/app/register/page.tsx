"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          user_name: userName,
        }),
      });

      setEmail("");
      setUserName("");
      setPassword("");

      setMessage(
        `Registration successful. Welcome, ${data.user_name}!`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed"
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-8">
        <h1 className="mb-6 text-2xl font-bold">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

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

          <button
            type="submit"
            className="w-full rounded bg-black p-3 text-white"
          >
            Register
          </button>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "http://localhost:8000/auth/google/login";
            }}
            className="w-full rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
          >
            Continue with Google
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