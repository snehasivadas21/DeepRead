"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { accessToken, clearAccessToken } = useAuth();

  const isAuthenticated = !!accessToken;

  function handleLogout() {
    clearAccessToken();
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold"
        >
          DeepRead
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-black"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-black"
            >
              How It Works
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Get Started
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}