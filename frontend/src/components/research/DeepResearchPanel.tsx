"use client";

import { useState } from "react";
import { useResearch } from "@/hooks/useResearch";
import ResearchProgress from "@/components/research/ResearchProgress";
import ResearchReport from "@/components/research/ResearchReport";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import CitationModal from "@/components/chat/CitationModal";
import type { ResearchEvidence } from "@/types/research";

interface DeepResearchPanelProps {
  workspaceId: number;
}

export default function DeepResearchPanel({
  workspaceId,
}: DeepResearchPanelProps) {
  const [query, setQuery] = useState("");

  const {
    research,
    history,
    starting,
    error,
    startResearch,
    resetResearch,
    loadResearch,
  } = useResearch(workspaceId);

  const { accessToken } = useAuth();

  const [citationPreview, setCitationPreview] = useState<{
    source_name: string;
    page_number: number;
    text: string;
    } | null>(null);

  const [loadingCitation, setLoadingCitation] = useState(false);
  const [citationError, setCitationError] = useState<string | null>(null);

  async function handleEvidenceClick(evidence: ResearchEvidence) {
    if (!accessToken) return;

    setCitationPreview(null);
    setCitationError(null);
    setLoadingCitation(true);

    try {
        const preview = await apiRequest(
        `/workspaces/${workspaceId}/sources/${evidence.source_id}/chunks/${evidence.chunk_id}`,
        {},
        accessToken,
        );

        setCitationPreview(preview);
    } catch (err) {
        setCitationError(
        err instanceof Error ? err.message : "Failed to load evidence.",
        );
    } finally {
        setLoadingCitation(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!query.trim() || starting) return;

    await startResearch(query);
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col">
      <div className="border-b pb-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Deep Research
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Explore a question across your workspace sources and generate
          a structured research report.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label
            htmlFor="research-query"
            className="block text-sm font-medium text-gray-700"
          >
            What would you like to research?
          </label>

          <textarea
            id="research-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a research question..."
            rows={3}
            disabled={starting}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!query.trim() || starting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {starting ? "Starting research..." : "Start research"}
            </button>

            {research && (
              <button
                type="button"
                onClick={() => {
                  resetResearch();
                  setQuery("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                New research
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto py-5">
        {history.length > 0 && (
          <section className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">
              Research History
            </h3>

            <ul className="space-y-2">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void loadResearch(item.id)}
                    className="w-full rounded-lg border p-3 text-left hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {item.query}
                    </p>
                    <p className="mt-1 text-xs capitalize text-gray-500">
                      {item.status}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {!research && !starting && !error && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <h3 className="font-medium text-gray-800">
              Ready to investigate
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Enter a question above to start a multi-step research task.
            </p>
          </div>
        )}

        {(starting || research) && (
          <>
            {research && <ResearchProgress research={research} />}

            {research?.status === "completed" && (
              <ResearchReport research={research} onEvidenceClick={handleEvidenceClick}/>
            )}

            {(loadingCitation || citationPreview || citationError) && (
                <CitationModal
                    preview={citationPreview}
                    loading={loadingCitation}
                    onClose={() => {
                    setCitationPreview(null);
                    setCitationError(null);
                    }}
                />
            )}

            {research?.status === "failed" && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                Research failed. You can start a new research task.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}