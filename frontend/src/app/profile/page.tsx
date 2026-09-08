"use client";

import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const router = useRouter();

  const {
    profile,
    loading,
    updating,
    error,
    saveProfile,
  } = useProfile();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Unable to load profile
          </h1>

          <p className="mt-2 text-red-500">
            {error || "Profile not found."}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-5 rounded-lg bg-black px-5 py-3 text-white"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your DeepRead profile.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Profile */}
      <section className="mx-auto max-w-4xl px-6 py-10">

        <div className="rounded-xl border bg-white p-6 shadow-sm md:p-8">

          {/* Profile header */}
          <div className="mb-8 flex items-center gap-5 border-b pb-6">

            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold">
                {profile.name}
              </h2>

              <p className="text-sm text-gray-500">
                {profile.email}
              </p>
            </div>

          </div>

          {/* Form */}
          <ProfileForm
            profile={profile}
            updating={updating}
            onSave={saveProfile}
          />

          {/* Account information */}
          <div className="mt-10 border-t pt-6">

            <h3 className="mb-4 font-semibold">
              Account Information
            </h3>

            <div className="grid gap-4 text-sm md:grid-cols-2">

              <div>
                <p className="text-gray-500">
                  User ID
                </p>

                <p className="mt-1 font-medium">
                  {profile.user_id}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Email
                </p>

                <p className="mt-1 font-medium">
                  {profile.email}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Created
                </p>

                <p className="mt-1 font-medium">
                  {new Date(
                    profile.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Last Updated
                </p>

                <p className="mt-1 font-medium">
                  {new Date(
                    profile.updated_at
                  ).toLocaleDateString()}
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}