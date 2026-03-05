"use client";

import type { Message } from "@/types";

interface Props {
  message: Pick<Message, "role" | "content" | "created_at">;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div
          className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
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
      )}

      <div className={`max-w-[80%] sm:max-w-[70%]`}>
        {/* Label */}
        {!isUser && (
          <span className="mb-1 block text-[11px] font-semibold tracking-wide text-[#5b600b]">
            QA TESTER AI
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-md text-[#d8f0d8]"
              : "rounded-bl-md text-[#d8f0d8]"
          }`}
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #29422b, #1e3520)",
                  boxShadow:
                    "3px 3px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(41,66,43,0.15)",
                }
              : {
                  background: "#182318",
                  boxShadow:
                    "3px 3px 8px rgba(0,0,0,0.3), -2px -2px 6px rgba(41,66,43,0.08)",
                  border: "1px solid rgba(41,66,43,0.2)",
                }
          }
        >
          {message.content}
        </div>

        {/* Timestamp */}
        {time && (
          <span
            className={`mt-1 block text-[10px] text-[#5a805a] ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
