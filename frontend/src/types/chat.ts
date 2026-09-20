export interface Citation {
  citation_id: number;
  source_id: number;
  source_name: string;
  page_number: number;
  chunk_id: number;
}

export interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export interface Conversation {
  id: number;
  workspace_id: number;
  title: string;
}

export interface CitationPreview {
  source_name: string;
  page_number: number;
  text: string;
}

export interface CitationModalProps {
  preview: CitationPreview | null;
  loading: boolean;
  onClose: () => void;
}

