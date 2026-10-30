
"use client";

import { useEffect, useState } from "react";
import {
  getEvaluationDatasets,
  getEvaluationCases,
  runEvaluation,
  getEvaluationHistory,
  type EvaluationDataset,
  type EvaluationCase,
  type EvaluationResult,
  type EvaluationRun,
} from "@/services/evaluationService";
import { useAuth } from "@/context/AuthContext";

interface EvaluationPanelProps {
  workspaceId: number;
  accessToken?: string | null;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">
        {value === null ? "N/A" : `${(value * 100).toFixed(1)}%`}
      </p>
    </div>
  );
}

export default function EvaluationPanel({
  workspaceId,
}: EvaluationPanelProps) {
  const [datasets, setDatasets] = useState<EvaluationDataset[]>([]);
  const [cases, setCases] = useState<EvaluationCase[]>([]);
  const [history, setHistory] = useState<EvaluationRun[]>([]);
  const [datasetId, setDatasetId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [topK, setTopK] = useState(5);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const { accessToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadDatasets() {
      setLoading(true);
      setError("");

      try {
        const [datasetData, historyData] = await Promise.all([
          getEvaluationDatasets(workspaceId, accessToken),
          getEvaluationHistory(accessToken),
        ]);

        if (cancelled) return;

        setDatasets(datasetData);
        setHistory(historyData);

        if (datasetData.length > 0) {
          setDatasetId(String(datasetData[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load evaluation data.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDatasets();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      setCases([]);
      setCaseId("");
      setResult(null);

      if (!datasetId) return;

      try {
        const data = await getEvaluationCases(
          Number(datasetId),
          accessToken,
        );

        if (cancelled) return;

        setCases(data);

        if (data.length > 0) {
          setCaseId(String(data[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load evaluation cases.",
          );
        }
      }
    }

    void loadCases();

    return () => {
      cancelled = true;
    };
  }, [datasetId, accessToken]);

  async function handleRunEvaluation() {
    if (!caseId) {
      setError("Select an evaluation case first.");
      return;
    }

    setRunning(true);
    setError("");
    setResult(null);

    try {
      const data = await runEvaluation(
        Number(caseId),
        topK,
        accessToken,
      );

      setResult(data);

      const updatedHistory = await getEvaluationHistory(accessToken);
      setHistory(updatedHistory);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Evaluation failed. Please try again.",
      );
    } finally {
      setRunning(false);
    }
  }

  const workspaceHistory = history.filter(
    (run) => datasets.some((dataset) => dataset.id === run.dataset_id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">RAG Evaluation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Measure retrieval quality and answer quality for this workspace.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Run an evaluation</h3>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">
            Loading evaluation data...
          </p>
        ) : datasets.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            No evaluation datasets found for this workspace. Create a dataset
            and add evaluation cases before running an evaluation.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="evaluation-dataset"
                className="mb-1 block text-sm font-medium"
              >
                Dataset
              </label>
              <select
                id="evaluation-dataset"
                value={datasetId}
                onChange={(event) => setDatasetId(event.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="evaluation-case"
                className="mb-1 block text-sm font-medium"
              >
                Evaluation question
              </label>
              <select
                id="evaluation-case"
                value={caseId}
                onChange={(event) => {
                  setCaseId(event.target.value);
                  setResult(null);
                }}
                disabled={cases.length === 0}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
              >
                {cases.length === 0 ? (
                  <option value="">No active cases available</option>
                ) : (
                  cases.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.question}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="evaluation-top-k"
                className="mb-1 block text-sm font-medium"
              >
                Top K retrieved chunks
              </label>
              <input
                id="evaluation-top-k"
                type="number"
                min={1}
                max={100}
                value={topK}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value) && value >= 1 && value <= 100) {
                    setTopK(value);
                  }
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={running || !caseId || loading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? "Evaluating..." : "Run Evaluation"}
            </button>
          </div>
        )}
      </section>

      {result && (
        <section className="space-y-4">
          <div>
            <h3 className="font-semibold">Evaluation results</h3>
            <p className="mt-1 text-sm text-gray-600">{result.question}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="Precision@K" value={result.precision_at_k} />
            <Metric label="Recall@K" value={result.recall_at_k} />
            <Metric label="F1@K" value={result.f1_at_k} />
            <Metric label="Answer relevance" value={result.answer_relevance} />
            <Metric label="Faithfulness" value={result.faithfulness} />
            <Metric label="Relevant chunks found" value={result.relevant_found}/>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h4 className="font-semibold">Generated answer</h4>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {result.answer}
            </p>

            {result.answer_quality_explanation && (
              <>
                <h4 className="mt-5 font-semibold">
                  Answer quality explanation
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  {result.answer_quality_explanation}
                </p>
              </>
            )}

            <p className="mt-4 text-sm text-gray-500">
              Retrieved chunk IDs:{" "}
              {result.retrieved_chunk_ids.length > 0
                ? result.retrieved_chunk_ids.join(", ")
                : "None"}
            </p>
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Evaluation history</h3>

        {workspaceHistory.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No evaluations have been recorded for this workspace yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="px-3 py-2">Question</th>
                  <th className="px-3 py-2">Precision@K</th>
                  <th className="px-3 py-2">Recall@K</th>
                  <th className="px-3 py-2">F1@K</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {workspaceHistory.map((run) => (
                  <tr key={run.id} className="border-b last:border-0">
                    <td className="max-w-xs px-3 py-3">{run.question}</td>
                    <td className="px-3 py-3">
                      {(run.precision_at_k * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3">
                      {run.recall_at_k === null
                        ? "N/A"
                        : `${(run.recall_at_k * 100).toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-3">
                      {run.f1_at_k === null
                        ? "N/A"
                        : `${(run.f1_at_k * 100).toFixed(1)}%`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {new Date(run.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
