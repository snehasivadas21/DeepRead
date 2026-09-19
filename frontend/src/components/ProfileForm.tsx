"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { ProfileUpdateData, UserProfile } from "@/types/profile";

interface ProfileFormProps {
  profile: UserProfile;
  updating: boolean;
  onSave: (data: ProfileUpdateData) => Promise<void>;
}

export default function ProfileForm({ profile, updating, onSave }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [profileImage, setProfileImage] = useState(profile.profile_image || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name);
    setProfileImage(profile.profile_image || "");
  }, [profile]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        profile_image: profileImage || null,
      });
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    }
  }

  const hasChanges = name.trim() !== profile.name || profileImage !== (profile.profile_image || "");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar upload */}
      <div className="flex items-center gap-6">
        <div className="group relative h-24 w-24 shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-semibold text-gray-600 ring-2 ring-gray-100">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-xs font-medium text-transparent transition group-hover:bg-black/50 group-hover:text-white"
          >
            Change
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <p className="mt-1 text-xs text-gray-500">JPG or PNG. Click the photo to change it.</p>
          {profileImage && (
            <button
              type="button"
              onClick={() => setProfileImage("")}
              className="mt-2 text-xs font-medium text-red-600 hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="w-full rounded-lg border p-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border bg-gray-50 p-3 text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
      </div>

      {/* Messages */}
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {/* Save */}
      <div className="flex items-center gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={updating || !hasChanges}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {updating ? "Saving..." : "Save Changes"}
        </button>
        {!hasChanges && !message && (
          <span className="text-xs text-gray-400">No changes to save</span>
        )}
      </div>
    </form>
  );
}