// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "⌂" },
  { name: "Research", href: "/research", icon: "⌕" },
  { name: "Profile", href: "/profile", icon: "◯" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Continue to login even if logout request fails
    }
    router.push("/login");
  }

  return (
    <aside
      className={`flex min-h-screen flex-col border-r bg-white transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between border-b px-4 py-6">
        <Link href="/" className={collapsed ? "hidden" : "block"}>
          <h1 className="text-2xl font-bold">DeepRead</h1>
          <p className="mt-1 text-xs text-gray-500">AI Research Platform</p>
        </Link>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <span className="text-lg">↪</span>
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}