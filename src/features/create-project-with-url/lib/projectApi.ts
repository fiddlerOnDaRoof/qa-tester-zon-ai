import type { Project } from "@/types";

/** Fetch all projects for the current user. */
export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Failed to fetch projects (${res.status})`);
  }
  const json = await res.json();
  return json.data ?? [];
}

/** Create a new project. */
export async function createProject(input: {
  name: string;
  target_url: string;
}): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Failed to create project (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}
