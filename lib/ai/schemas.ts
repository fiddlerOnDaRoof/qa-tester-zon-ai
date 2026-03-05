import { z } from "zod";

export const TestPlanSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      target: z.string().optional(),
      expected: z.string(),
    })
  ),
  summary: z.string(),
});

export type TestPlan = z.infer<typeof TestPlanSchema>;

export const CommandIntentSchema = z.object({
  intent: z.enum([
    "create_project",
    "run_test",
    "view_project",
    "view_run",
    "chat",
    "unknown",
  ]),
  params: z.record(z.unknown()).optional(),
});

export type CommandIntent = z.infer<typeof CommandIntentSchema>;
