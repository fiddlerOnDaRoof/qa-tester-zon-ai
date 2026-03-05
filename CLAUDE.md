# Database Rules

- Shared Supabase — ALL table names prefixed with `qa_tester_zon_ai_`
- Use `dbTable(name)` helper from `lib/dbTable.ts` for all table references
- Create/alter tables via Management API ($SUPABASE_PROJECT_REF and $SUPABASE_MGMT_TOKEN env vars are ALREADY SET — just use them):
  ```
  curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/database/query" \
    -H "Authorization: Bearer $SUPABASE_MGMT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "..."}'
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
