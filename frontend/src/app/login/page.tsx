"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/services/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(""); 

  const router = useRouter();

  const { setAccessToken } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");

    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) {
      return;
    }

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      setAccessToken(data.access_token)

      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err) {
      toast.error(
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
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border p-3"
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>  

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded border p-3 pr-10"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="mt-1 text-sm text-red-600">
                {passwordError}
              </p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-black"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-black p-3 text-white"
          >
            Login
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

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-black hover:underline"
            >
              Register
            </Link>
          </p>
        </form>

      </div>
    </main>
  );
}