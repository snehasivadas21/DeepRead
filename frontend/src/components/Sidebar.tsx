"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "Research",
    href: "/research",
    icon: "⌕",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "◯",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Continue to login even if logout request fails
    }

    router.push("/login");
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-white">

      {/* Logo */}
      <div className="border-b px-6 py-6">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            DeepRead
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            AI Research Platform
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <span className="text-lg">
                {item.icon}
              </span>

              {item.name}
            </Link>
          );
        })}

      </nav>

      {/* Bottom section */}
      <div className="border-t p-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <span className="text-lg">
            ↪
          </span>

          Logout
        </button>

      </div>

    </aside>
  );
}