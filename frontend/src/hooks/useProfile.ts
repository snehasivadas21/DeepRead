"use client";

import { useCallback, useEffect, useState } from "react";
import {getProfile,updateProfile,} from "@/services/profile.service";
import {UserProfile,} from "@/types/profile";
import { useAuth } from "@/context/AuthContext";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const { accessToken, isAuthLoading } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (isAuthLoading) return;

    if (!accessToken) {
      setLoading(false);
      return;
    };

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
  }, [accessToken, isAuthLoading]);

  useEffect(()=>{
    fetchProfile();
  },[fetchProfile])

  const saveProfile = async (
    data: FormData
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
