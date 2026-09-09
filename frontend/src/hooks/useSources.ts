"use client";

import { useCallback, useEffect, useState } from "react";

import {getSources,uploadSource,deleteSource,} from "@/services/source.service";

import { Source } from "@/types/source";
import { useAuth } from "@/context/AuthContext";

export function useSources(workspaceId: number) {
  const { accessToken } = useAuth();

  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchSources = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getSources(
        workspaceId,
        accessToken
      );

      setSources(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load sources."
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceId, accessToken]);

  const uploadFile = async (file: File) => {
    if (!accessToken) {
      throw new Error("Not authenticated.");
    }

    try {
      setUploading(true);
      setError("");

      const newSource = await uploadSource(
        workspaceId,
        file,
        accessToken
      );

      setSources((currentSources) => [
        newSource,
        ...currentSources,
      ]);

      return newSource;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload source.";

      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const removeSource = async (sourceId: number) => {
    if (!accessToken) {
      throw new Error("Not authenticated.");
    }

    try {
      setError("");

      await deleteSource(
        workspaceId,
        sourceId,
        accessToken
      );

      setSources((currentSources) =>
        currentSources.filter(
          (source) => source.id !== sourceId
        )
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete source.";

      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    loading,
    uploading,
    error,
    fetchSources,
    uploadFile,
    removeSource,
  };
}