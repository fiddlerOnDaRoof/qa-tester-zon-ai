"use client";

import { useAppStore } from "@/store/appStore";
import { useProjects } from "../lib/hooks";
import type { Project } from "@/types";

interface Props {
  onNewProject: () => void;
}

export default function ProjectList({ onNewProject }: Props) {
  const { selectedProjectId, setSelectedProjectId } = useAppStore();
  const { data: projects, isLoading, error } = useProjects();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#29422b]/30 px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5a805a]">Projects</h2>
        <button
          onClick={onNewProject}
          className="flex items-center gap-1 rounded-md border border-[#29422b]/40 px-2 py-1 text-xs font-medium text-[#7ab07a] transition-colors hover:bg-[#29422b]/20 hover:text-[#c8e8c8]"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <svg className="h-4 w-4 animate-spin text-[#5a805a]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {error && (
          <p className="px-2 py-4 text-xs text-red-400">Failed to load projects</p>
        )}

        {!isLoading && projects && projects.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #1a2e1a, #29422b)",
                boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(41,66,43,0.2)",
              }}
            >
              <svg className="h-5 w-5 text-[#5a805a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <p className="text-xs text-[#5a805a]">No projects yet</p>
            <button
              onClick={onNewProject}
              className="mt-1 text-xs font-medium text-[#7ab07a] underline decoration-[#7ab07a]/30 transition-colors hover:text-[#c8e8c8]"
            >
              Create your first project
            </button>
          </div>
        )}

        {projects?.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onSelect={() => setSelectedProjectId(project.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  isSelected,
  onSelect,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
}) {
  let hostname = "";
  try {
    hostname = new URL(project.target_url).hostname;
  } catch {
    hostname = project.target_url;
  }

  return (
    <button
      onClick={onSelect}
      className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition-all ${
        isSelected
          ? "text-[#d8f0d8]"
          : "text-[#7ab07a] hover:bg-[#29422b]/15 hover:text-[#c8e8c8]"
      }`}
      style={
        isSelected
          ? {
              background: "linear-gradient(135deg, rgba(41,66,43,0.35), rgba(41,66,43,0.2))",
              boxShadow:
                "inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(41,66,43,0.15), 0 0 8px rgba(41,66,43,0.15)",
            }
          : undefined
      }
    >
      <div className="text-sm font-medium leading-tight">{project.name}</div>
      <div className="mt-0.5 truncate text-[10px] text-[#5a805a]">{hostname}</div>
    </button>
  );
}
