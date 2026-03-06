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
