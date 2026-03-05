import type { TestRun } from "@/types";

/** Fetch all test runs for a project. */
export async function fetchProjectRuns(projectId: string): Promise<TestRun[]> {
  const res = await fetch(`/api/projects/${projectId}/runs`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Failed to fetch runs (${res.status})`);
  }
  const json = await res.json();
  return json.data ?? [];
}

/** Create a new test run for a project. */
export async function createRun(
  projectId: string,
  input: { mode: "full" | "targeted"; instructions?: string }
): Promise<TestRun> {
  const res = await fetch(`/api/projects/${projectId}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Failed to create run (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}
