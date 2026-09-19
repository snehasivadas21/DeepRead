"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiRequest } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import CitationModal from "./CitationModal";
import { Message, Citation } from "@/types/chat";

interface ChatPanelProps {
  workspaceId: number;
}

const PAGE_SIZE = 20;

export default function ChatPanel({ workspaceId,}: ChatPanelProps) {
  const { accessToken } = useAuth();

  const [conversationId, setConversationId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const loadingOlderMessages = useRef(false);

  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const [citationPreview, setCitationPreview] = useState<{
    source_name: string;
    page_number: number;
    text: string;
  } | null>(null);

  const [loadingCitation, setLoadingCitation] = useState(false);  

  async function loadMessages(
    activeConversationId: number,
    currentOffset: number,
    preserveScroll = false,
  ) {
    if (
      loadingOlderMessages.current ||
      !hasMoreMessages ||
      !accessToken
    ) {
      return;
    }

    const container = chatContainerRef.current;

    const previousScrollHeight =
      container?.scrollHeight ?? 0;

    loadingOlderMessages.current = true;
    setLoadingHistory(true);

    try {
      const history = await apiRequest(
        `/conversations/${activeConversationId}/messages?limit=${PAGE_SIZE}&offset=${currentOffset}`,
        {},
        accessToken,
      );

      if (history.length < PAGE_SIZE) {
        setHasMoreMessages(false);
      }

      const formattedMessages: Message[] =
        history.reverse().map(
          (message: {
            id: number;
            role: "user" | "assistant";
            content: string;
            citations?: Citation[];
          }) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            citations: message.citations ?? [],
          }),
        );

      setMessages((previous) => [
        ...formattedMessages,
        ...previous,
      ]);

      setOffset(
        currentOffset + history.length,
      );

      if (preserveScroll) {
        requestAnimationFrame(() => {
          if (!container) {
            return;
          }

          const newScrollHeight =
            container.scrollHeight;

          container.scrollTop =
            newScrollHeight -
            previousScrollHeight;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load messages",
      );
    } finally {
      loadingOlderMessages.current = false;
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    async function loadConversation() {
      try {
        setLoadingHistory(true);
        setError(null);

        const conversations = await apiRequest(
          `/conversations/?workspace_id=${workspaceId}`,
          {},
          accessToken,
        );

        if (conversations.length === 0) {
          setConversationId(null);
          setMessages([]);
          setHasMoreMessages(false);
          return;
        }

        const latestConversation =
          conversations[0];

        setConversationId(
          latestConversation.id,
        );

        setMessages([]);
        setOffset(0);
        setHasMoreMessages(true);

        await loadMessages(
          latestConversation.id,
          0,
        );

        requestAnimationFrame(() => {
          const container =
            chatContainerRef.current;

          if (container) {
            container.scrollTop =
              container.scrollHeight;
          }
        });
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

  async function handleScroll() {
    const container =
      chatContainerRef.current;

    if (!container || !conversationId) {
      return;
    }

    if (container.scrollTop <= 20) {
      await loadMessages(
        conversationId,
        offset,
        true,
      );
    }
  }

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
    setMessages([]);
    setOffset(0);
    setHasMoreMessages(false);

    return conversation.id;
  }

  async function sendMessage(
    event: FormEvent,
  ) {
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
      let activeConversationId =
        conversationId;

      if (!activeConversationId) {
        activeConversationId =
          await createConversation();
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
          content:
            response.assistant_message.content,
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

  async function handleCitationClick(citation: Citation) {
    if (!accessToken) return;

    setSelectedCitation(citation);
    setCitationPreview(null);
    setLoadingCitation(true);

    try {
      const preview = await apiRequest(
        `/workspaces/${workspaceId}/sources/${citation.source_id}/chunks/${citation.chunk_id}`,
        {},
        accessToken,
      );

      setCitationPreview(preview);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load citation",
      );
    } finally {
      setLoadingCitation(false);
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

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-gray-50 p-4"
      >
        {loadingHistory &&
        messages.length === 0 ? (
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
                Ask anything about the documents
                in this workspace.
              </p>
            </div>
          </div>
        ) : (
          <>
            {loadingHistory &&
              hasMoreMessages && (
                <div className="text-center text-xs text-gray-500">
                  Loading older messages...
                </div>
              )}

            {messages.map(
              (message, index) => (
                <div
                  key={
                    message.id ?? index
                  }
                >
                  <div
                    className={
                      message.role ===
                      "user"
                        ? "ml-auto max-w-[80%] rounded-xl bg-black px-4 py-3 text-sm text-white"
                        : "mr-auto max-w-[80%] rounded-xl border bg-white px-4 py-3 text-sm text-gray-800"
                    }
                  >
                    <div className="whitespace-pre-wrap">
                      {message.content.split(/(\[\d+\])/g).map((part, index) => {
                        const match = part.match(/^\[(\d+)\]$/);

                        if (!match) {
                          return <span key={index}>{part}</span>;
                        }

                        const citationNumber = Number(match[1]);

                        const citation = message.citations?.find(
                          (item) => item.citation_id === citationNumber,
                        );

                        if (!citation) {
                          return <span key={index}>{part}</span>;
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleCitationClick(citation)}
                            className="mx-0.5 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            [{citationNumber}]
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {message.role ===
                    "assistant" &&
                    message.citations &&
                    message.citations.length >
                      0 && (
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
                                Source{" "}
                                {
                                  citation.source
                                }
                                {" · "}
                                Page{" "}
                                {
                                  citation.page_number
                                }
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ),
            )}
          </>
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
          disabled={
            loading || !input.trim()
          }
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {selectedCitation && (
        <CitationModal
          preview={citationPreview}
          loading={loadingCitation}
          onClose={() => {
            setSelectedCitation(null);
            setCitationPreview(null);
          }}
        />
      )}
    </div>
  );
}

