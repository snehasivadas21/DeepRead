"use client";

import type { ResearchDetails } from "@/types/research";

interface ResearchProgressProps {
  research: ResearchDetails;
}

const statusLabels: Record<string, string> = {
  pending: "Waiting to start",
  planning: "Planning research",
  researching: "Investigating sources",
  synthesizing: "Preparing final report",
  completed: "Research completed",
  failed: "Research failed",
};

export default function ResearchProgress({
  research,
}: ResearchProgressProps) {
  const progress = Math.min(
    100,
    Math.max(0, research.progress ?? 0),
  );

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Deep Research
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            {statusLabels[research.status] ??
              research.status}
          </p>
        </div>

        <span className="text-sm font-medium text-gray-700">
          {progress}%
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label="Research progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-purple-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {research.status === "failed" && (
        <p className="mt-3 text-sm text-red-600">
          Research could not be completed. Please try again.
        </p>
      )}

      {research.steps.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">
            Research steps
          </h4>

          <ol className="space-y-3">
            {research.steps.map((step) => (
              <li
                key={step.id}
                className="flex items-start gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                  {step.step_number}
                </span>

                <div className="min-w-0">
                  <p className="text-sm text-gray-800">
                    {step.question}
                  </p>

                  <p className="mt-1 text-xs capitalize text-gray-500">
                    {step.status}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
