"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject } from "./projectApi";
import { useAppStore } from "@/store/appStore";

export const PROJECTS_KEY = ["projects"] as const;

/** Fetch all projects for the current user. */
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: fetchProjects,
  });
}

/** Create a new project. On success invalidates projects query and auto-selects the new project. */
export function useCreateProject() {
  const qc = useQueryClient();
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId);

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      setSelectedProjectId(project.id);
    },
  });
}
