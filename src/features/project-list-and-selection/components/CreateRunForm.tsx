"use client";

import { useState, useCallback } from "react";
import { useCreateRun } from "../lib/hooks";

interface Props {
  projectId: string;
}

export default function CreateRunForm({ projectId }: Props) {
  const [mode, setMode] = useState<"full" | "targeted">("full");
  const [instructions, setInstructions] = useState("");
  const createRun = useCreateRun(projectId);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      createRun.mutate(
        {
          mode,
          instructions: mode === "targeted" ? instructions : undefined,
        },
        {
          onSuccess: () => {
            setInstructions("");
          },
        }
      );
    },
    [mode, instructions, createRun]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#d8f0d8]">Start Test Run</h3>
      </div>

      {/* Mode toggle */}
      <div
        className="mb-3 inline-flex rounded-lg border border-[#29422b]/30 p-0.5"
        style={{ background: "rgba(14,22,14,0.6)" }}
      >
        <button
          type="button"
          onClick={() => setMode("full")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "full"
              ? "text-[#d8f0d8]"
              : "text-[#5a805a] hover:text-[#7ab07a]"
          }`}
          style={
            mode === "full"
              ? {
                  background: "linear-gradient(135deg, rgba(127,36,240,0.25), rgba(127,36,240,0.15))",
                  boxShadow: "0 0 8px rgba(127,36,240,0.2)",
                }
              : undefined
          }
        >
          Test Everything
        </button>
        <button
          type="button"
          onClick={() => setMode("targeted")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "targeted"
              ? "text-[#d8f0d8]"
              : "text-[#5a805a] hover:text-[#7ab07a]"
          }`}
          style={
            mode === "targeted"
              ? {
                  background: "linear-gradient(135deg, rgba(127,36,240,0.25), rgba(127,36,240,0.15))",
                  boxShadow: "0 0 8px rgba(127,36,240,0.2)",
                }
              : undefined
          }
        >
          Custom Instructions
        </button>
      </div>

      {/* Instructions textarea (only for targeted mode) */}
      {mode === "targeted" && (
        <div className="mb-3">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Describe what you want to test... e.g. 'Test the login form with invalid credentials and check error messages'"
            rows={3}
            className="w-full resize-none rounded-lg border border-[#29422b]/40 bg-[#0d1a0d] px-3 py-2 text-sm text-[#d8f0d8] placeholder-[#3a5a3a] outline-none transition-colors focus:border-[#7f24f0]/50 focus:ring-1 focus:ring-[#7f24f0]/30"
          />
        </div>
      )}

      {/* Error */}
      {createRun.isError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {createRun.error?.message ?? "Failed to start run"}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={createRun.isPending || (mode === "targeted" && !instructions.trim())}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
        style={{
          background: "linear-gradient(135deg, #7f24f0, #5a1ab0)",
          boxShadow: "0 2px 12px rgba(127,36,240,0.35), 0 0 6px rgba(127,36,240,0.15)",
        }}
      >
        {createRun.isPending ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Starting…
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
            </svg>
            Run Tests
          </>
        )}
      </button>
    </form>
  );
}
