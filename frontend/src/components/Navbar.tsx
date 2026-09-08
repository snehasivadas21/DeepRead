"use client";

import Link from "next/link";

export default function Navbar() {
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
        </div>

      </div>
    </nav>
  );
}
