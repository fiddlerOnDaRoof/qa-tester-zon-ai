"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjectRuns, createRun } from "./runsApi";

export const RUNS_KEY = (projectId: string) => ["runs", projectId] as const;

/** Fetch test runs for a specific project. Polls every 5s when any run is active. */
export function useProjectRuns(projectId: string | null) {
  return useQuery({
    queryKey: RUNS_KEY(projectId ?? ""),
    queryFn: () => fetchProjectRuns(projectId!),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const runs = query.state.data;
      const hasActive = runs?.some(
        (r) => r.status === "pending" || r.status === "running"
      );
      return hasActive ? 5000 : false;
    },
  });
}

/** Create a new test run. Invalidates the runs query on success. */
export function useCreateRun(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: { mode: "full" | "targeted"; instructions?: string }) =>
      createRun(projectId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RUNS_KEY(projectId) });
    },
  });
}
