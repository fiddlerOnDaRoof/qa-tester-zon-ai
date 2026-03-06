# Database Rules

- Shared Supabase — ALL table names prefixed with `qa_tester_zon_ai_`
- Use `dbTable(name)` helper from `lib/dbTable.ts` for all table references
- Create/alter tables via Management API ($SUPABASE_PROJECT_REF and $SUPABASE_MGMT_TOKEN env vars are ALREADY SET — just use them):
  ```
  curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/database/query" \
    -H "Authorization: Bearer $SUPABASE_MGMT_TOKEN" \
    -H "Content-Type: application/json" \
    -d {query: ...}
  ```
- Enable RLS on every new table
- Add anon SELECT/INSERT/UPDATE/DELETE policies as needed

# Architecture

- **Framework**: Next.js App Router (TypeScript, Tailwind)
- **Auth**: Supabase Auth
- **State**: React Query (server state), Zustand (client: `selectedProjectId`, `activeConversationId`)
- **AI**: Anthropic SDK (`lib/ai/adapter.ts`) — model: `claude-sonnet-4-6`
- **Test execution**: `lib/executor/runner.ts` — MVP in-process simulator; swap for Playwright later
- **PWA**: `public/manifest.json` + next-pwa

# Code Conventions

- All Supabase `.from()` calls must use `dbTable("tablename")` — never hardcode table names
- API routes live in `app/api/` — use structured logs with `requestId`, `userId`, `runId`
- Validate all structured AI outputs with Zod schemas from `lib/ai/schemas.ts`
- RLS policies: users can only access their own rows (`auth.uid() = user_id`)

# Storage

- Bucket: `qatesterai-artifacts`
- Path pattern: `qatesterai/{userId}/{projectId}/{runId}/...`
- Always use signed URLs via `/api/runs/:id/artifacts/signed-url`

# Self-Heal Error Reporting (REQUIRED)

This project uses the shared incubator self-heal monitoring system. All errors MUST be reported to `incubator_self_heal_errors` (NOT prefixed — this is a shared incubator table).

## Frontend Error Capture (ALREADY INSTALLED)

`SelfHealErrorCapture` component in `components/SelfHealErrorCapture.tsx` is mounted in Providers. It automatically captures `window.onerror` and `unhandledrejection` events. **Do not remove it.**

## Database Error Capture

For critical Supabase queries, wrap with `withDbErrorCapture` from `lib/selfHeal.ts`:

```typescript
import { withDbErrorCapture } from "@/lib/selfHeal";

// Instead of:
const { data, error } = await supabase.from(dbTable("runs")).select("*");

// Use:
const { data, error } = await withDbErrorCapture(
  dbTable("runs"),
  supabase.from(dbTable("runs")).select("*"),
);
```

Use `withDbErrorCapture` for:
- All `.insert()`, `.update()`, `.delete()` operations
- Critical `.select()` queries that power main UI features
- Skip for non-critical reads like analytics/optional data

## Manual Error Reporting

For try/catch blocks and API route errors, use `reportSelfHealError`:

```typescript
import { reportSelfHealError } from "@/lib/selfHeal";

try {
  // risky operation
} catch (err) {
  reportSelfHealError("frontend", "ComponentName", err.message, {
    errorStack: err.stack,
    metadata: { context: "what was happening" },
  });
}
```

For API routes (server-side), import from `lib/selfHeal` and use category `"database"` or `"frontend"` as appropriate.

## Categories

- `"frontend"` — React component errors, unhandled rejections, client-side failures
- `"database"` — Supabase query failures, RLS errors, constraint violations
- `"build_deploy"` — Build failures, typecheck errors (reported by daemon)
- `"edge_function"` — Edge function invocation failures (reported by daemon)

## Rules

1. **Never swallow errors silently** — every catch block should either re-throw or call `reportSelfHealError`
2. **Always include project_prefix** — already set to `"qa_tester_zon_ai_"` in `lib/selfHeal.ts`
3. **Fire-and-forget** — error reporting never blocks the caller; never awaited
4. **No prefixed table** — `incubator_self_heal_errors` is a shared incubator table, do NOT use `dbTable()` for it


## Project Context

## QA Tester AI — Coding Conventions (for Claude)

### FILE STRUCTURE (required)
- Every feature lives in:  
  `src/features/<feature-name>/components/`, `src/features/<feature-name>/lib/`, `src/features/<feature-name>/<feature-name>.test.ts`
- Route files are thin wrappers only:  
  `app/<route>/page.tsx`, `app/api/<route>/route.ts` import and call feature modules.

### API RESPONSE SHAPE (required)
- All Route Handlers return: `{ data: T, error: string | null }`  
  - On failure: `{ data: null, error: "..." }` (no throwing past handler boundary).

### DB / SUPABASE (required)
- Use Supabase **server client** in Route Handlers; **browser client** in components.
- Every query must be scoped to the authenticated user (and project ownership) via `user_id = auth.uid()` (RLS enforces this; still filter explicitly).
- Tables are prefixed: `qa_tester_zon_ai_*` (never create unprefixed tables).

### NO NEW LIBRARIES (required)
- Do not add dependencies without explicit user approval.

---

## Data Model (tables + key relations)
- `qa_tester_zon_ai_profiles (user_id PK -> auth.users.id, display_name)`
- `qa_tester_zon_ai_conversations (id, user_id, title, created_at)`
- `qa_tester_zon_ai_messages (id, conversation_id -> conversations.id, role, content, created_at, meta_json)`
- `qa_tester_zon_ai_projects (id, user_id, name, target_url, created_at, updated_at)`
- `qa_tester_zon_ai_test_runs (id, project_id -> projects.id, user_id, mode, instructions, status, progress_json, summary_json, error_text, started_at, finished_at)`
- `qa_tester_zon_ai_run_findings (id, run_id -> test_runs.id, severity, title, description, evidence_json, created_at)`
- `qa_tester_zon_ai_artifacts (id, run_id -> test_runs.id, kind, path, mime_type, created_at, meta_json)`
- Storage bucket: `qatesterai-artifacts`  
  - Path convention: `qatesterai/{userId}/{projectId}/{runId}/...`
  - Signed URLs are generated via Route Handler only.

## App Architecture Patterns
- Next.js App Router with route groups: `(auth)` and `(app)`.
- Server state: **React Query** for `projects`, `runs`, `messages` (queries + mutations live in feature `lib/`).
- Client state: **Zustand only** for `selectedProjectId` and `activeConversationId` (no other global state).
- Live run status: polling via React Query every **2–5s** (SSE is optional later; don’t implement unless asked).

## API Surface (Route Handlers)
- `/api/chat` (stream or non-stream) for QA Tester chat + command intents.
- `/api/conversations`, `/api/projects`, `/api/projects/:id/runs`, `/api/runs/:id`, `/api/runs/:id/findings`, `/api/runs/:id/artifacts/signed-url`
- Handlers must:
  - Derive `userId` from Supabase auth on every request.
  - Validate inputs (zod) before DB/LLM calls.
  - Log structured context: `requestId`, `userId`, and when relevant `projectId`/`runId`.

## LLM Integration
- Server-side provider key only (env var); never call LLM directly from client.
- All structured LLM outputs must be validated with **zod schemas** in `lib/ai/*` (e.g., test plan, command intents).
- Chat-driven commands map to internal actions (create project, start run, fetch status) via validated “intent” objects.

## Test Execution (MVP + future swap)
- Use `lib/executor/*` “executor” interface.
- MVP executor simulates/records steps + artifacts; design must keep a clean boundary so Playwright worker can replace it later (no UI code calling executor directly; only via API + feature lib).

## Pages (routing expectations)
- `app/(auth)/login/page.tsx`
- `app/(app)/home/page.tsx` (chat + conversation memory + command UI)
- `app/(app)/projects/page.tsx` and optionally `app/(app)/projects/[projectId]/page.tsx` for details/status.
