"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import {
  createConversation,
  getCitationPreview,
  getConversations,
  getMessages,
  sendMessageStream,
} from "@/services/chat";

import {
  Citation,
  CitationPreview,
  Message,
} from "@/types/chat";

const PAGE_SIZE = 20;

export function useChat(workspaceId: number) {
  const { accessToken } = useAuth();

  const chatContainerRef =
    useRef<HTMLDivElement | null>(null);

  const loadingOlderMessages =
    useRef(false);

  const [conversationId, setConversationId] =
    useState<number | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [hasMoreMessages, setHasMoreMessages] =
    useState(true);

  const [offset, setOffset] = useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedCitation, setSelectedCitation] =
    useState<Citation | null>(null);

  const [citationPreview, setCitationPreview] =
    useState<CitationPreview | null>(null);

  const [loadingCitation, setLoadingCitation] =
    useState(false);

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

    const container =
      chatContainerRef.current;

    const previousScrollHeight =
      container?.scrollHeight ?? 0;

    loadingOlderMessages.current = true;
    setLoadingHistory(true);

    try {
      const history = await getMessages(
        activeConversationId,
        PAGE_SIZE,
        currentOffset,
        accessToken,
      );

      if (history.length < PAGE_SIZE) {
        setHasMoreMessages(false);
      }

      const formattedMessages: Message[] =
        [...history].reverse().map(
          (message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            citations:
              message.citations ?? [],
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
      if (!accessToken) {
        return;
      }

      try {
        setLoadingHistory(true);
        setError(null);

        const conversations =
          await getConversations(
            workspaceId,
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

    loadConversation();
  }, [workspaceId, accessToken]);

  async function handleScroll() {
    const container =
      chatContainerRef.current;

    if (
      !container ||
      !conversationId
    ) {
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

  async function startConversation() {
    if (!accessToken) {
      throw new Error(
        "Authentication required",
      );
    }

    const conversation =
      await createConversation(
        workspaceId,
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

    if (
      !content ||
      loading ||
      !accessToken
    ) {
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
      {
        role: "assistant",
        content: "",
        citations: [],
      },
    ]);

    setInput("");

    try {
      let activeConversationId =
        conversationId;

      if (!activeConversationId) {
        activeConversationId =
          await startConversation();
      }

      await sendMessageStream(
        activeConversationId,
        content,
        accessToken,
        (token) => {
          setMessages((previous) => {
            const updated = [...previous];

            const lastIndex =
              updated.length - 1;

            if (
              updated[lastIndex]?.role !==
              "assistant"
            ) {
              return previous;
            }

            updated[lastIndex] = {
              ...updated[lastIndex],
              content:
                updated[lastIndex].content +
                token,
            };

            return updated;
          });

          requestAnimationFrame(() => {
            const container =
              chatContainerRef.current;

            if (container) {
              container.scrollTop =
                container.scrollHeight;
            }
          });
        },
        (citations) => {
          setMessages((previous) => { 
            const updated = [...previous]; 
            const lastIndex = updated.length - 1; 
            if ( 
              updated[lastIndex]?.role !== "assistant" 
            ) { 
              return previous; 
            } 
            updated[lastIndex] = {
              ...updated[lastIndex], citations, 
            }; 
            return updated; 
          }); 
        }, 
      );
      
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

  async function handleCitationClick(
    citation: Citation,
  ) {
    if (!accessToken) {
      return;
    }

    setSelectedCitation(citation);
    setCitationPreview(null);
    setLoadingCitation(true);

    try {
      const preview =
        await getCitationPreview(
          workspaceId,
          citation,
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

  function closeCitation() {
    setSelectedCitation(null);
    setCitationPreview(null);
  }

  return {
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
  };
}

