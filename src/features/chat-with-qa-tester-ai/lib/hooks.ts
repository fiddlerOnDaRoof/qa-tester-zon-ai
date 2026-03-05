"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
} from "./chatApi";
import type { Message } from "@/types";

const CONVERSATIONS_KEY = ["conversations"] as const;
const messagesKey = (id: string) => ["messages", id] as const;

/** List conversations for current user. */
export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: fetchConversations,
  });
}

/** Create a new conversation. */
export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createConversation(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY }),
  });
}

/** Messages for a specific conversation. */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: messagesKey(conversationId ?? ""),
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });
}

/** Send a message and stream the response. Returns streaming state + send function. */
export function useSendMessage(conversationId: string | null) {
  const qc = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (content: string) => {
      if (!conversationId) return;

      setError(null);
      setIsStreaming(true);
      setStreamingContent("");

      // Optimistically add user message to cache
      const optimisticUserMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        meta_json: null,
      };

      qc.setQueryData<Message[]>(messagesKey(conversationId), (old) => [
        ...(old ?? []),
        optimisticUserMsg,
      ]);

      try {
        const stream = await sendMessage(conversationId, content);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingContent(accumulated);
        }

        // Stream complete — add final assistant message to cache and refetch
        const assistantMsg: Message = {
          id: `temp-assistant-${Date.now()}`,
          conversation_id: conversationId,
          role: "assistant",
          content: accumulated,
          created_at: new Date().toISOString(),
          meta_json: null,
        };

        qc.setQueryData<Message[]>(messagesKey(conversationId), (old) => [
          ...(old ?? []),
          assistantMsg,
        ]);

        // Refetch to get real DB IDs
        qc.invalidateQueries({ queryKey: messagesKey(conversationId) });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to send message";
        setError(msg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [conversationId, qc]
  );

  return { send, isStreaming, streamingContent, error, clearError: () => setError(null) };
}
