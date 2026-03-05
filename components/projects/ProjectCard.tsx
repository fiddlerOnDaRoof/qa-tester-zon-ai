"use client";

import { Project } from "@/types";

interface Props {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
      <p className="mt-1 text-xs text-gray-500 truncate">{project.target_url}</p>
      <p className="mt-2 text-xs text-gray-400">
        Created {new Date(project.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
