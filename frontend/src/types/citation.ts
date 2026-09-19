export interface Citation {
  citation_id: number;
  source_id: number;
  source_name: string;
  page_number: number;
  chunk_id: number;
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