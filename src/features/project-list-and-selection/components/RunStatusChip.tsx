"use client";

import type { RunStatus } from "@/types";

const STATUS_CONFIG: Record<RunStatus, { label: string; dotColor: string; borderColor: string; bgColor: string }> = {
  pending: {
    label: "Pending",
    dotColor: "#5b600b",
    borderColor: "rgba(91,96,11,0.3)",
    bgColor: "rgba(91,96,11,0.12)",
  },
  running: {
    label: "Running",
    dotColor: "#7f24f0",
    borderColor: "rgba(127,36,240,0.3)",
    bgColor: "rgba(127,36,240,0.1)",
  },
  completed: {
    label: "Completed",
    dotColor: "#34d399",
    borderColor: "rgba(52,211,153,0.3)",
    bgColor: "rgba(52,211,153,0.1)",
  },
  failed: {
    label: "Failed",
    dotColor: "#f87171",
    borderColor: "rgba(248,113,113,0.3)",
    bgColor: "rgba(248,113,113,0.1)",
  },
};

export default function RunStatusChip({ status }: { status: RunStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium text-[#d8f0d8]"
      style={{
        borderColor: config.borderColor,
        background: config.bgColor,
      }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "running" ? "animate-pulse" : ""}`}
        style={{ background: config.dotColor }}
      />
      {config.label}
    </span>
  );
}
