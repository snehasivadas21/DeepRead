
import { apiRequest } from "@/services/api";

export interface EvaluationDataset {
  id: number;
  name: string;
  workspace_id: number;
  created_at: string;
}

export interface EvaluationCase {
  id: number;
  dataset_id: number;
  question: string;
  expected_answer?: string | null;
  relevant_chunk_ids: number[];
  is_active: boolean;
  created_at: string;
}

export interface EvaluationResult {
  run_id: number;
  case_id: number;
  dataset_id: number;
  workspace_id: number;
  question: string;
  top_k: number;
  retrieved_chunk_ids: number[];
  relevant_chunk_ids: number[];
  relevant_found: number;
  precision_at_k: number;
  recall_at_k: number | null;
  f1_at_k: number | null;
  answer: string;
  answer_relevance: number;
  faithfulness: number;
  answer_quality_explanation?: string;
}

export interface EvaluationRun {
  id: number;
  dataset_id: number;
  case_id: number;
  user_id: number;
  question: string;
  top_k: number;
  precision_at_k: number;
  recall_at_k: number | null;
  f1_at_k: number | null;
  retrieved_chunk_ids: number[];
  relevant_chunk_ids: number[];
  created_at: string;
}

export async function getEvaluationDatasets(
  workspaceId: number,
  accessToken?: string | null,
): Promise<EvaluationDataset[]> {
  return apiRequest(
    `/evaluation/datasets?workspace_id=${workspaceId}`,
    { method: "GET" },
    accessToken,
  );
}

export async function getEvaluationCases(
  datasetId: number,
  accessToken?: string | null,
): Promise<EvaluationCase[]> {
  return apiRequest(
    `/evaluation/datasets/${datasetId}/cases`,
    { method: "GET" },
    accessToken,
  );
}

export async function runEvaluation(
  caseId: number,
  topK: number,
  accessToken?: string | null,
): Promise<EvaluationResult> {
  return apiRequest(
    `/evaluation/run?case_id=${caseId}&top_k=${topK}`,
    { method: "POST" },
    accessToken,
  );
}

export async function getEvaluationHistory(
  accessToken?: string | null,
): Promise<EvaluationRun[]> {
  return apiRequest(
    "/evaluation/history",
    { method: "GET" },
    accessToken,
  );
}
