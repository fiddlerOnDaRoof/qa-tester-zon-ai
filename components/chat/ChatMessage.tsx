"use client";

import { Message } from "@/types";

interface Props {
  message: Pick<Message, "role" | "content">;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {!isUser && (
          <span className="mb-1 block text-xs font-semibold text-blue-600">
            QA Tester AI
          </span>
        )}
        {message.content}
      </div>
    </div>
  );
}
