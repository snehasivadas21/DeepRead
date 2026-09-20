"use client";

import CitationModal from "@/components/chat/CitationModal";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import { useChat } from "@/hooks/useChat";

interface ChatPanelProps {
  workspaceId: number;
}

export default function ChatPanel({
  workspaceId,
}: ChatPanelProps) {
  const {
    chatContainerRef,
    messages,
    input,
    setInput,
    loading,
    loadingHistory,
    hasMoreMessages,
    error,
    sendMessage,
    handleScroll,
    handleCitationClick,
    selectedCitation,
    citationPreview,
    loadingCitation,
    closeCitation,
  } = useChat(workspaceId);

  return (
    <div className="flex h-full flex-col rounded-xl border bg-gray-50 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Research Chat
        </h2>

        <p className="text-sm text-gray-500">
          Ask questions about your uploaded sources.
        </p>
      </div>

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg bg-gray-100 p-4"
      >
        {loadingHistory && (
          <p className="text-center text-sm text-gray-500">
            Loading conversation...
          </p>
        )}

        {!loadingHistory && hasMoreMessages && messages.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            Scroll up to load older messages
          </p>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              Start a conversation about your documents.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id ?? `${message.role}-${index}`}
            message={message}
            onCitationClick={handleCitationClick}
          />
        ))}

        {loading && (
          <div className="mr-auto max-w-[80%] rounded-xl border bg-white px-4 py-3 text-sm text-gray-500">
            Thinking...
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <ChatInput
        value={input}
        loading={loading}
        onChange={setInput}
        onSubmit={sendMessage}
      />

      {selectedCitation && (
        <CitationModal
          preview={citationPreview}
          loading={loadingCitation}
          onClose={closeCitation}
        />
      )}
    </div>
  );
}
