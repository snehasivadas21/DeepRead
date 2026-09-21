import { apiRequest } from "@/services/api";
import {
  Citation,
  CitationPreview,
  Conversation,
  Message,
} from "@/types/chat";

export async function getConversations(
  workspaceId: number,
  accessToken: string,
): Promise<Conversation[]> {
  return apiRequest(
    `/conversations/?workspace_id=${workspaceId}`,
    {},
    accessToken,
  );
}

export async function getMessages(
  conversationId: number,
  limit: number,
  offset: number,
  accessToken: string,
): Promise<Message[]> {
  const messages = await apiRequest(
    `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    {},
    accessToken,
  );

  return messages;
}

export async function createConversation(
  workspaceId: number,
  accessToken: string,
): Promise<Conversation> {
  return apiRequest(
    "/conversations/",
    {
      method: "POST",
      body: JSON.stringify({
        workspace_id: workspaceId,
        title: "Research Chat",
      }),
    },
    accessToken,
  );
}

export async function sendMessage(
  conversationId: number,
  content: string,
  accessToken: string,
) {
  return apiRequest(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    },
    accessToken,
  );
}

export async function getCitationPreview(
  workspaceId: number,
  citation: Citation,
  accessToken: string,
): Promise<CitationPreview> {
  return apiRequest(
    `/workspaces/${workspaceId}/sources/${citation.source_id}/chunks/${citation.chunk_id}`,
    {},
    accessToken,
  );
}

export async function sendMessageStream(
  conversationId: number,
  content: string,
  accessToken: string,
  onToken: (token: string) => void,
  onCitations: (citations: Citation[]) => void,
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/messages/stream`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content,
      }),
    },
  );

  if (!response.ok) {
    const data = await response.text();

    throw new Error(
      data || "Failed to stream response",
    );
  }

  if (!response.body) {
    throw new Error("Streaming response body is empty");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullResponse = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, {
        stream: true,
      });

      fullResponse += chunk;
    }

    const remaining = decoder.decode();

    if (remaining) {
      fullResponse += remaining;
    }

    const citationMarker = "\n\n__CITATIONS__\n";

    const markerIndex = fullResponse.indexOf(citationMarker);

    if (markerIndex === -1) {
      onToken(fullResponse);
      return;
    }

    const answer = fullResponse.slice(0, markerIndex);
    const citationData = fullResponse.slice(
      markerIndex + citationMarker.length,
    );

    onToken(answer);

    const citations: Citation[] = JSON.parse(citationData);

    onCitations(citations);
  } finally {
    reader.releaseLock();
  }
}

