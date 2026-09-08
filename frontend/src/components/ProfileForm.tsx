"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ProfileUpdateData,
  UserProfile,
} from "@/types/profile";

interface ProfileFormProps {
  profile: UserProfile;
  updating: boolean;
  onSave: (data: ProfileUpdateData) => Promise<void>;
}

export default function ProfileForm({
  profile,
  updating,
  onSave,
}: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [profileImage, setProfileImage] = useState(
    profile.profile_image || ""
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(profile.name);
    setProfileImage(profile.profile_image || "");
  }, [profile]);

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
        profile_image: profileImage.trim() || null,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Profile image */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Profile Image URL
        </label>

        <input
          type="url"
          value={profileImage}
          onChange={(e) =>
            setProfileImage(e.target.value)
          }
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border p-3 outline-none focus:ring-2"
        />

        {profileImage && (
          <img
            src={profileImage}
            alt="Profile"
            className="mt-4 h-20 w-20 rounded-full object-cover"
          />
        )}
      </div>

      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="w-full rounded-lg border p-3 outline-none focus:ring-2"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Email
        </label>

        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full rounded-lg border bg-gray-100 p-3 text-gray-500"
        />

        <p className="mt-1 text-xs text-gray-500">
          Email cannot be changed here.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={updating}
        className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
      >
        {updating ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
