import { apiRequest } from "@/services/api";
import {Workspace,WorkspaceCreateData,WorkspaceUpdateData,} from "@/types/workspace";

export async function createWorkspace(
  data: WorkspaceCreateData,accessToken: string | null
): Promise<Workspace> {
  return apiRequest("/workspaces/", {
    method: "POST",
    body: JSON.stringify(data),
  },accessToken);
}

export async function getWorkspaces(accessToken: string | null): Promise<Workspace[]> {
  return apiRequest("/workspaces/", {
    method: "GET",
  },accessToken);
}

export async function getWorkspace(
  workspaceId: number, accessToken: string | null
): Promise<Workspace> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "GET",
  },accessToken);
}

export async function updateWorkspace(
  workspaceId: number,
  data: WorkspaceUpdateData,
  accessToken: string | null
): Promise<Workspace> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  },accessToken);
}

export async function deleteWorkspace(
  workspaceId: number,
  accessToken: string | null
): Promise<{ message: string }> {
  return apiRequest(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  },accessToken);
}