
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createResearch, getResearchDetails,} from "@/services/research.service";
import type { ResearchDetails } from "@/types/research";

export function useResearch(workspaceId: number) {
  const { accessToken } = useAuth();

  const [researchId, setResearchId] = useState<number | null>(null);
  const [research, setResearch] = useState<ResearchDetails | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startResearch = useCallback(
    async (query: string) => {
      if (!accessToken) {
        setError("Please log in to start research.");
        return;
      }

      if (!query.trim() || starting) return;

      try {
        setStarting(true);
        setError(null);
        setResearch(null);
        setResearchId(null);

        const task = await createResearch(
          workspaceId,
          query.trim(),
          accessToken,
        );

        setResearchId(task.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start research.",
        );
      } finally {
        setStarting(false);
      }
    },
    [workspaceId, accessToken, starting],
  );

  useEffect(() => {
    if (!researchId || !accessToken) return;

    if (
      research?.status === "completed" ||
      research?.status === "failed"
    ) {
      return;
    }

    let cancelled = false;

    async function fetchProgress() {
      try {
        const details = await getResearchDetails(
          researchId!,
          accessToken!,
        );

        if (!cancelled) {
          setResearch(details);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load research progress.",
          );
        }
      }
    }

    void fetchProgress();

    const interval = setInterval(() => {
      void fetchProgress();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [researchId, accessToken, research?.status]);

  function resetResearch() {
    setResearchId(null);
    setResearch(null);
    setError(null);
  }

  return {
    research,
    researchId,
    starting,
    error,
    startResearch,
    resetResearch,
  };
}
