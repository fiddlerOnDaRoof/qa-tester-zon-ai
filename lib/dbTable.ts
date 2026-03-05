/** Returns the prefixed table name for the shared Supabase instance. */
export const dbTable = (name: string): string => `qa_tester_zon_ai_${name}`;
