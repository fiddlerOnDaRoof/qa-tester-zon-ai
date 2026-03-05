"use client";

import type { Project, TestRun } from "@/types";
import { useProjectRuns } from "../lib/hooks";
import RunStatusChip from "./RunStatusChip";
import CreateRunForm from "./CreateRunForm";

interface Props {
  project: Project;
}

export default function ProjectDetail({ project }: Props) {
  const { data: runs, isLoading, error } = useProjectRuns(project.id);

  let hostname = "";
  try {
    hostname = new URL(project.target_url).hostname;
  } catch {
    hostname = project.target_url;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Project header card */}
      <div
        className="rounded-xl border border-[#29422b]/30 p-5"
        style={{
          background: "linear-gradient(160deg, #141f14 0%, #182318 100%)",
          boxShadow:
            "inset 2px 2px 6px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(41,66,43,0.08), 0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-[#d8f0d8]">{project.name}</h1>
            <a
              href={project.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm text-[#7ab07a] underline decoration-[#7ab07a]/30 transition-colors hover:text-[#c8e8c8]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.924a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.12 8.137" />
              </svg>
              {hostname}
            </a>
            <p className="mt-2 text-xs text-[#5a805a]">
              Created {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Latest run status badge */}
          <LatestRunBadge runs={runs} isLoading={isLoading} />
        </div>
      </div>

      {/* Create run form */}
      <div
        className="mt-4 rounded-xl border border-[#29422b]/30 p-4"
        style={{
          background: "linear-gradient(160deg, #141f14 0%, #182318 100%)",
          boxShadow:
            "inset 2px 2px 6px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(41,66,43,0.06), 0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        <CreateRunForm projectId={project.id} />
      </div>

      {/* Runs table */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-[#d8f0d8]">Test Runs</h2>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <svg className="h-5 w-5 animate-spin text-[#5a805a]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Failed to load runs
          </div>
        )}

        {!isLoading && runs && runs.length === 0 && <RunsEmptyState />}

        {!isLoading && runs && runs.length > 0 && (
          <div className="overflow-x-auto">
            <RunsTable runs={runs} />
          </div>
        )}
      </div>
    </div>
  );
}

function LatestRunBadge({
  runs,
  isLoading,
}: {
  runs: TestRun[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-1.5 rounded-full border border-[#29422b]/30 px-2.5 py-1 text-[10px] font-medium text-[#5a805a]"
        style={{ background: "rgba(41,66,43,0.1)" }}
      >
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <div
        className="flex items-center gap-1.5 rounded-full border border-[#29422b]/30 px-2.5 py-1 text-[10px] font-medium text-[#7ab07a]"
        style={{ background: "rgba(41,66,43,0.15)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#5b600b]" />
        Ready
      </div>
    );
  }

  return <RunStatusChip status={runs[0].status} />;
}

function RunsTable({ runs }: { runs: TestRun[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-[#29422b]/20 text-[10px] uppercase tracking-wider text-[#5a805a]">
          <th className="px-3 py-2 font-medium">Status</th>
          <th className="px-3 py-2 font-medium">Mode</th>
          <th className="hidden px-3 py-2 font-medium sm:table-cell">Started</th>
          <th className="hidden px-3 py-2 font-medium md:table-cell">Duration</th>
          <th className="px-3 py-2 font-medium">Instructions</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <RunRow key={run.id} run={run} />
        ))}
      </tbody>
    </table>
  );
}

function RunRow({ run }: { run: TestRun }) {
  const startedDate = run.started_at ? new Date(run.started_at) : null;
  const finishedDate = run.finished_at ? new Date(run.finished_at) : null;

  let duration = "";
  if (startedDate && finishedDate) {
    const diffMs = finishedDate.getTime() - startedDate.getTime();
    const secs = Math.floor(diffMs / 1000);
    if (secs < 60) {
      duration = `${secs}s`;
    } else {
      const mins = Math.floor(secs / 60);
      const remainSecs = secs % 60;
      duration = `${mins}m ${remainSecs}s`;
    }
  } else if (run.status === "running") {
    duration = "In progress…";
  }

  return (
    <tr
      className="border-b border-[#29422b]/10 transition-colors hover:bg-[#29422b]/10"
    >
      <td className="px-3 py-2.5">
        <RunStatusChip status={run.status} />
      </td>
      <td className="px-3 py-2.5 text-xs text-[#7ab07a]">
        {run.mode === "full" ? "Full scan" : "Targeted"}
      </td>
      <td className="hidden px-3 py-2.5 text-xs text-[#5a805a] sm:table-cell">
        {startedDate
          ? startedDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </td>
      <td className="hidden px-3 py-2.5 text-xs text-[#5a805a] md:table-cell">
        {duration || "—"}
      </td>
      <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-[#5a805a]">
        {run.instructions || "—"}
      </td>
    </tr>
  );
}

function RunsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#29422b]/30 py-12 text-center"
      style={{ background: "rgba(14,22,14,0.4)" }}
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, #1a2e1a, #29422b)",
          boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(41,66,43,0.2)",
        }}
      >
        <svg className="h-6 w-6 text-[#5a805a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
      </div>
      <p className="text-sm text-[#5a805a]">No test runs yet</p>
      <p className="mt-1 text-xs text-[#3a5a3a]">Use the form above to start your first test run</p>
    </div>
  );
}
