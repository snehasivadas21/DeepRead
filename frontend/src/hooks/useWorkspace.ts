"use client";

import { useCallback, useEffect, useState } from "react";
import { getWorkspace } from "@/services/workspace.service";
import { Workspace } from "@/types/workspace";
import { useAuth } from "@/context/AuthContext";

export function useWorkspace(workspaceId: number) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { accessToken } = useAuth();

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId || Number.isNaN(workspaceId)) {
      setError("Invalid workspace id.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await getWorkspace(workspaceId, accessToken);
      setWorkspace(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, accessToken]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  return { workspace, loading, error, refetch: fetchWorkspace };
}