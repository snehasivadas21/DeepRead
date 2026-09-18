"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Citation {
  source: number;
  chunk_id: number;
  source_id: number;
  page_number: number;
  similarity: number;
}

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

interface ChatPanelProps {
  workspaceId: number;
}

export default function ChatPanel({
  workspaceId,
}: ChatPanelProps) {
  const { accessToken } = useAuth();

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConversation() {
      try {
        setLoadingHistory(true);

        const conversations = await apiRequest(
          `/conversations/?workspace_id=${workspaceId}`,
          {},
          accessToken,
        );

        if (conversations.length > 0) {
          const latestConversation = conversations[0];

          setConversationId(latestConversation.id);

          const history = await apiRequest(
            `/conversations/${latestConversation.id}/messages`,
            {},
            accessToken,
          );

          setMessages(
            history.map(
              (message: {
                id: number;
                role: "user" | "assistant";
                content: string;
              }) => ({
                id: message.id,
                role: message.role,
                content: message.content,
              }),
            ),
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversation",
        );
      } finally {
        setLoadingHistory(false);
      }
    }

    if (accessToken) {
      loadConversation();
    }
  }, [workspaceId, accessToken]);

  async function createConversation() {
    const conversation = await apiRequest(
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

    setConversationId(conversation.id);

    return conversation.id;
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const content = input.trim();

    if (!content || loading) {
      return;
    }

    setError(null);
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content,
      },
    ]);

    setInput("");

    try {
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        activeConversationId = await createConversation();
      }

      const response = await apiRequest(
        `/conversations/${activeConversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content,
          }),
        },
        accessToken,
      );

      setMessages((previous) => [
        ...previous,
        {
          id: response.assistant_message.id,
          role: "assistant",
          content: response.assistant_message.content,
          citations: response.citations,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[600px] flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          AI Chat
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Ask questions about your research.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-gray-50 p-4">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-gray-700">
                Start a conversation
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Ask anything about the documents in this workspace.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id ?? index}>
              <div
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[80%] rounded-xl bg-black px-4 py-3 text-sm text-white"
                    : "mr-auto max-w-[80%] rounded-xl border bg-white px-4 py-3 text-sm text-gray-800"
                }
              >
                {message.content}
              </div>

              {message.role === "assistant" &&
                message.citations &&
                message.citations.length > 0 && (
                  <div className="mt-2 mr-auto max-w-[80%]">
                    <p className="mb-1 text-xs font-medium text-gray-500">
                      Sources
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {message.citations.map(
                        (citation) => (
                          <div
                            key={`${message.id}-${citation.source}`}
                            className="rounded-md border bg-white px-2 py-1 text-xs text-gray-600"
                          >
                            Source {citation.source}
                            {" · "}
                            Page {citation.page_number}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))
        )}

        {loading && (
          <div className="mr-auto rounded-xl border bg-white px-4 py-3 text-sm text-gray-500">
            Thinking...
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        onSubmit={sendMessage}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask about your documents..."
          disabled={loading}
          className="flex-1 rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}