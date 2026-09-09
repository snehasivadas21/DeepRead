import { apiRequest } from "@/services/api";
import { Source } from "@/types/source";

export async function uploadSource(
  workspaceId: number,
  file: File,
  accessToken: string | null
): Promise<Source> {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest(
    `/workspaces/${workspaceId}/sources/upload`,
    {
      method: "POST",
      body: formData,
    },
    accessToken
  );
}

export async function getSources(
  workspaceId: number,
  accessToken: string | null
): Promise<Source[]> {
  return apiRequest(
    `/workspaces/${workspaceId}/sources/`,
    {
      method: "GET",
    },
    accessToken
  );
}

export async function deleteSource(
  workspaceId: number,
  sourceId: number,
  accessToken: string | null
): Promise<{ message: string }> {
  return apiRequest(
    `/workspaces/${workspaceId}/sources/${sourceId}`,
    {
      method: "DELETE",
    },
    accessToken
  );
}