import { apiRequest } from "@/services/api";
import type { ResearchCreated, ResearchDetails } from "@/types/research";

export async function createResearch(
  workspaceId: number,
  query: string,
  accessToken: string,
): Promise<ResearchCreated> {
  return apiRequest(
    "/research/",
    {
      method: "POST",
      body: JSON.stringify({
        workspace_id: workspaceId,
        query,
      }),
    },
    accessToken,
  );
}

export async function getResearchDetails(
  researchId: number,
  accessToken: string,
): Promise<ResearchDetails> {
  return apiRequest(
    `/research/${researchId}/details`,
    {},
    accessToken,
  );
}
