"use client";

import { useCallback, useEffect, useState } from "react";
import {getProfile,updateProfile,} from "@/services/profile.service";
import {UserProfile,ProfileUpdateData,} from "@/types/profile";
import { useAuth } from "@/context/AuthContext";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const { accessToken } = useAuth();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProfile(accessToken);

      setProfile(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = async (
    data: ProfileUpdateData
  ) => {
    try {
      setUpdating(true);
      setError("");

      const updatedProfile = await updateProfile(data,accessToken);

      setProfile(updatedProfile);

      return updatedProfile;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update profile.";

      setError(message);

      throw err;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    updating,
    error,
    saveProfile,
    fetchProfile,
  };
}
