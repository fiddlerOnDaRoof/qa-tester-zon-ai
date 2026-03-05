export interface Profile {
  user_id: string;
  display_name: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  meta_json: Record<string, unknown> | null;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  target_url: string;
  created_at: string;
  updated_at: string;
}

export type RunStatus = "pending" | "running" | "completed" | "failed";
export type RunMode = "full" | "targeted";

export interface TestRun {
  id: string;
  project_id: string;
  user_id: string;
  mode: RunMode;
  instructions: string | null;
  status: RunStatus;
  progress_json: Record<string, unknown> | null;
  summary_json: Record<string, unknown> | null;
  error_text: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface RunFinding {
  id: string;
  run_id: string;
  severity: Severity;
  title: string;
  description: string;
  evidence_json: Record<string, unknown> | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  run_id: string;
  kind: string;
  path: string;
  mime_type: string;
  created_at: string;
  meta_json: Record<string, unknown> | null;
}
