export interface Workspace {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceCreateData {
  name: string;
  description?: string | null;
}

export interface WorkspaceUpdateData {
  name: string;
  description?: string | null;
}