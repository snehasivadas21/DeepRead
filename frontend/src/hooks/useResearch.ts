
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createResearch, getResearchDetails, getResearchHistory} from "@/services/research.service";
import type { ResearchDetails } from "@/types/research";

export function useResearch(workspaceId: number) {
  const { accessToken } = useAuth();

  const [researchId, setResearchId] = useState<number | null>(null);
  const [research, setResearch] = useState<ResearchDetails | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    async function fetchHistory() {
      try {
        const items = await getResearchHistory(accessToken!);
        setHistory(items);
      } catch (err) {
        console.error("Failed to load research history:", err);
      }
    }

    void fetchHistory();
  }, [accessToken]);

  useEffect(() => {
    if (research?.status !== "completed" &&
        research?.status !== "failed") return;
    if (!accessToken) return;

    getResearchHistory(accessToken)
      .then(setHistory)
      .catch(console.error);
  }, [research?.status, accessToken]);

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

  async function loadResearch(id: number) {
    if (!accessToken) return;

    try {
      setError(null);
      setResearchId(id);
      const details = await getResearchDetails(id, accessToken);
      setResearch(details);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load research."
      );
    }
  }

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
    history,
    loadResearch,
  };
}
