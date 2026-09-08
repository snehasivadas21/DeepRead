import { apiRequest } from "@/services/api";
import {
  Workspace,
  WorkspaceCreateData,
  WorkspaceUpdateData,
} from "@/types/workspace";

export async function createWorkspace(
  data: WorkspaceCreateData
): Promise<Workspace> {
  return apiRequest("/workspaces/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWorkspaces(): Promise<Workspace[]> {
  return apiRequest("/workspaces/", {
    method: "GET",
  });
}

export async function getWorkspace(
  workspaceId: number
): Promise<Workspace> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "GET",
  });
}

export async function updateWorkspace(
  workspaceId: number,
  data: WorkspaceUpdateData
): Promise<Workspace> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkspace(
  workspaceId: number
): Promise<{ message: string }> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  });
}