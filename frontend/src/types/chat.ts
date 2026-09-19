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