"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Message } from "@/types";

interface Props {
  messages: Pick<Message, "role" | "content">[];
  isLoading?: boolean;
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-gray-400 text-sm">
          Start a conversation with your QA Tester AI…
        </div>
      )}
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-500">
            <span className="animate-pulse">QA Tester AI is thinking…</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
