
"use client";

import type { ResearchDetails } from "@/types/research";

interface ResearchReportProps {
  research: ResearchDetails;
}

export default function ResearchReport({
  research,
}: ResearchReportProps) {
  return (
    <section className="rounded-xl border bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">
        Research Report
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {research.query}
      </p>

      {research.report ? (
        <article className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-800">
          {research.report}
        </article>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          No final report is available yet.
        </p>
      )}

      {research.steps.some(
        (step) => step.analysis || step.evidence.length > 0,
      ) && (
        <details className="mt-6 border-t pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            View research findings and evidence
          </summary>

          <div className="mt-4 space-y-5">
            {research.steps.map((step) => (
              <div key={step.id}>
                <h4 className="font-medium text-gray-900">
                  {step.step_number}. {step.question}
                </h4>

                {(step.analysis || step.result) && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {step.analysis || step.result}
                  </p>
                )}

                {step.evidence.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {step.evidence.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg bg-gray-50 p-3"
                      >
                        <p className="whitespace-pre-wrap text-sm text-gray-700">
                          {item.content}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Source ID: {item.source_id}
                          {item.page_number != null
                            ? ` · Page ${item.page_number}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
