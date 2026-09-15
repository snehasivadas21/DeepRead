// app/profile/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { useProfile } from "@/hooks/useProfile";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, updating, error, saveProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
            <p className="text-sm text-gray-500">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Unable to load profile</h1>
            <p className="mt-2 text-red-500">{error || "Profile not found."}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-5 rounded-lg bg-black px-5 py-3 text-white"
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your DeepRead account details.
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">
            <ProfileForm profile={profile} updating={updating} onSave={saveProfile} />
          </div>
        </section>
      </main>
    </div>
  );
}