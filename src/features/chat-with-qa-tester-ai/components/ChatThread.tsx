"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import type { Message } from "@/types";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
}

export default function ChatThread({ messages, isStreaming, streamingContent }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      {isEmpty && (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          {/* Welcome graphic */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #29422b, #5b600b)",
              boxShadow:
                "0 0 24px rgba(41,66,43,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <svg
              className="h-8 w-8 text-[#c8e8c8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#d8f0d8]">QA Tester AI</h2>
            <p className="mt-1 max-w-sm text-sm text-[#5a805a]">
              Describe features to test, ask questions, or manage your testing projects through chat.
            </p>
          </div>
          {/* Quick action suggestions */}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {[
              "Help me plan test cases",
              "What should I test first?",
              "Find bugs in my signup flow",
            ].map((suggestion) => (
              <span
                key={suggestion}
                className="cursor-default rounded-full border border-[#29422b]/40 px-3 py-1.5 text-xs text-[#7ab07a] transition-colors"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {/* Streaming assistant message */}
      {isStreaming && streamingContent && (
        <ChatMessage
          message={{
            role: "assistant",
            content: streamingContent,
            created_at: new Date().toISOString(),
          }}
        />
      )}

      {/* Typing indicator when streaming but no content yet */}
      {isStreaming && !streamingContent && (
        <div className="mb-4 flex items-start gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, #29422b, #5b600b)",
              boxShadow: "0 0 8px rgba(41,66,43,0.4)",
            }}
          >
            <svg
              className="h-3.5 w-3.5 text-[#c8e8c8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <div
            className="rounded-2xl rounded-bl-md px-4 py-3"
            style={{
              background: "#182318",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.3), -2px -2px 6px rgba(41,66,43,0.08)",
              border: "1px solid rgba(41,66,43,0.2)",
            }}
          >
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#7ab07a]"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#7ab07a]"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[#7ab07a]"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
