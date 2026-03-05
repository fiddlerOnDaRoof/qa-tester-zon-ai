"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { useProjects } from "@/src/features/create-project-with-url/lib/hooks";
import ProjectList from "@/src/features/create-project-with-url/components/ProjectList";
import NewProjectModal from "@/src/features/create-project-with-url/components/NewProjectModal";
import ProjectDetail from "./ProjectDetail";

export default function ProjectsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId);
  const { data: projects } = useProjects();

  const selectedProject = projects?.find((p) => p.id === selectedProjectId) ?? null;

  // Edge case: if selectedProjectId doesn't match any project, clear selection
  useEffect(() => {
    if (selectedProjectId && projects && projects.length > 0 && !selectedProject) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId, projects, selectedProject, setSelectedProjectId]);

  return (
    <div className="flex h-[calc(100vh-53px)]">
      {/* Mobile drawer toggle */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-[#29422b]/40 text-[#7ab07a] md:hidden"
        style={{
          background: "linear-gradient(135deg, #182318, #1a2e1a)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 8px rgba(41,66,43,0.2)",
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      </button>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-[#29422b]/30 transition-transform duration-200
          md:relative md:z-auto md:translate-x-0
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "rgba(14,22,14,0.95)", backdropFilter: "blur(12px)" }}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-end border-b border-[#29422b]/30 px-3 py-2 md:hidden">
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-1 text-[#5a805a] hover:text-[#7ab07a]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ProjectList
          onNewProject={() => {
            setModalOpen(true);
            setDrawerOpen(false);
          }}
        />
      </aside>

      {/* Main panel */}
      <main className="flex-1 overflow-y-auto">
        {selectedProject ? (
          <ProjectDetail project={selectedProject} />
        ) : (
          <EmptyState onNewProject={() => setModalOpen(true)} />
        )}
      </main>

      {/* New project modal */}
      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #1a2e1a, #29422b)",
            boxShadow:
              "inset 3px 3px 6px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(41,66,43,0.15), 0 0 20px rgba(41,66,43,0.15)",
          }}
        >
          <svg className="h-8 w-8 text-[#5a805a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>

        <h2 className="text-base font-semibold text-[#d8f0d8]">Welcome to Project Testing</h2>
        <p className="mt-2 text-sm text-[#5a805a]">
          Create a project by providing a name and target URL, then run automated QA tests against it.
        </p>

        <button
          onClick={onNewProject}
          className="mt-5 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #7f24f0, #5a1ab0)",
            boxShadow: "0 4px 16px rgba(127,36,240,0.4), 0 0 8px rgba(127,36,240,0.2)",
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </button>
      </div>
    </div>
  );
}
