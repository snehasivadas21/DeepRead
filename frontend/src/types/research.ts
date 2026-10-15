
export type ResearchStatus =
  | "pending"
  | "planning"
  | "researching"
  | "synthesizing"
  | "completed"
  | "failed";

export interface ResearchCreated {
  id: number;
  workspace_id: number;
  query: string;
  status: ResearchStatus;
  current_step: number;
  progress: number;
  report: string | null;
}

export interface ResearchEvidence {
  id: number;
  source_id: number;
  chunk_id: number;
  content: string;
  page_number: number | null;
  relevance_score: number | null;
}

export interface ResearchStep {
  id: number;
  step_number: number;
  question: string;
  status: string;
  result: string | null;
  analysis: string | null;
  evidence: ResearchEvidence[];
}

export interface ResearchDetails extends ResearchCreated {
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  steps: ResearchStep[];
}
