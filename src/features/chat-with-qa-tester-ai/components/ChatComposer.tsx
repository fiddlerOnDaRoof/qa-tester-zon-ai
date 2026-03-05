"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatComposer({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="border-t border-[#29422b]/30 px-4 py-3 sm:px-6"
      style={{
        background: "rgba(13,26,13,0.9)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="flex items-end gap-3 rounded-xl p-2"
        style={{
          background: "#111d11",
          border: "1px solid rgba(41,66,43,0.3)",
          boxShadow:
            "inset 2px 2px 6px rgba(0,0,0,0.3), inset -1px -1px 4px rgba(41,66,43,0.05)",
        }}
      >
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[#d8f0d8] placeholder-[#5a805a] focus:outline-none"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message QA Tester AI… (Enter to send)"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30"
          style={{
            background: canSend
              ? "linear-gradient(135deg, #29422b, #5b600b)"
              : "transparent",
            boxShadow: canSend
              ? "0 2px 8px rgba(41,66,43,0.4)"
              : "none",
          }}
          aria-label="Send message"
        >
          <svg
            className="h-4 w-4 text-[#c8e8c8]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-[#5a805a]/60">
        Shift + Enter for new line
      </p>
    </div>
  );
}
