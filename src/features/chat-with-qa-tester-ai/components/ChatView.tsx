"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import {
  useConversations,
  useCreateConversation,
  useMessages,
  useSendMessage,
} from "../lib/hooks";
import ChatThread from "./ChatThread";
import ChatComposer from "./ChatComposer";

export default function ChatView() {
  const { activeConversationId, setActiveConversationId } = useAppStore();

  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const createConversation = useCreateConversation();

  const { data: messages, isLoading: loadingMessages } = useMessages(activeConversationId);
  const { send, isStreaming, streamingContent, error, clearError } =
    useSendMessage(activeConversationId);

  // Auto-select or create a conversation on mount
  useEffect(() => {
    if (loadingConvos) return;
    if (createConversation.isPending) return;
    if (activeConversationId) return;
    if (!conversations) return;

    if (conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    } else {
      createConversation.mutate("New Conversation", {
        onSuccess: (convo) => setActiveConversationId(convo.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, loadingConvos]);

  const handleSend = useCallback(
    (content: string) => {
      clearError();
      send(content);
    },
    [send, clearError]
  );

  const handleNewConversation = useCallback(() => {
    createConversation.mutate("New Conversation", {
      onSuccess: (convo) => setActiveConversationId(convo.id),
    });
  }, [createConversation, setActiveConversationId]);

  const conversationReady = !!activeConversationId;
  // Only block on the very first page load before we have any data
  const showInitialLoader = loadingConvos && !activeConversationId;
  const composerDisabled = isStreaming || !conversationReady || createConversation.isPending;

  return (
    <div className="flex h-[calc(100vh-53px)] flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between border-b border-[#29422b]/30 px-4 py-2.5 sm:px-6"
        style={{ background: "rgba(18,30,18,0.6)" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-[#d8f0d8]">Chat with QA Tester</h1>

          {/* Conversation selector */}
          {conversations && conversations.length > 1 && (
            <select
              className="rounded-md border border-[#29422b]/40 bg-[#111d11] px-2 py-1 text-xs text-[#7ab07a] focus:outline-none focus:ring-1 focus:ring-[#29422b]"
              value={activeConversationId ?? ""}
              onChange={(e) => setActiveConversationId(e.target.value)}
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleNewConversation}
          disabled={createConversation.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-[#29422b]/40 px-3 py-1.5 text-xs font-medium text-[#7ab07a] transition-colors hover:bg-[#29422b]/20 hover:text-[#c8e8c8] disabled:opacity-50"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Error banner (send errors) */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 sm:mx-6">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={clearError} className="text-xs underline hover:text-red-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Conversation creation error */}
      {createConversation.isError && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 sm:mx-6">
          <span className="flex-1">
            Failed to start conversation.{" "}
            <button
              onClick={() =>
                createConversation.mutate("New Conversation", {
                  onSuccess: (convo) => setActiveConversationId(convo.id),
                })
              }
              className="underline hover:text-red-300"
            >
              Retry
            </button>
          </span>
        </div>
      )}

      {/* Full-page spinner only on very first load */}
      {showInitialLoader ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#5a805a]">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </div>
        </div>
      ) : (
        <>
          {/* Message thread — always shown after initial load */}
          <ChatThread
            messages={messages ?? []}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            isLoadingMessages={loadingMessages && conversationReady}
          />

          {/* Composer */}
          <ChatComposer onSend={handleSend} disabled={composerDisabled} />
        </>
      )}
    </div>
  );
}
