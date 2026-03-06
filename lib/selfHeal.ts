import { supabase } from "@/lib/supabaseClient";

export type SelfHealCategory = "edge_function" | "frontend" | "database" | "build_deploy";

const PROJECT_PREFIX = "qa_tester_zon_ai_";

/**
 * Fire-and-forget error reporter for the incubator self-heal system.
 * Never throws, never blocks the caller.
 */
export function reportSelfHealError(
  category: SelfHealCategory,
  source: string,
  errorMessage: string,
  extra?: { errorStack?: string; metadata?: Record<string, unknown> },
): void {
  supabase
    .from("incubator_self_heal_errors")
    .insert({
      category,
      project_prefix: PROJECT_PREFIX,
      source,
      error_message: errorMessage,
      error_stack: extra?.errorStack ?? null,
      metadata: extra?.metadata ?? null,
    })
    .then(() => {})
    .catch(() => {});
}

/**
 * Wraps a Supabase query and logs database errors to self-heal.
 * Returns the original result unchanged.
 */
export async function withDbErrorCapture<T>(
  tableName: string,
  query: PromiseLike<{ data: T; error: any }>,
): Promise<{ data: T; error: any }> {
  const result = await query;
  if (result.error) {
    reportSelfHealError("database", tableName, result.error.message ?? String(result.error), {
      metadata: { code: result.error.code, details: result.error.details },
    });
  }
  return result;
}
