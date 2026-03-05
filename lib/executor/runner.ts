/**
 * MVP in-process test executor.
 * Simulates run steps and emits progress updates.
 * Designed to be swapped for a real Playwright worker later.
 */

export interface RunStep {
  stepIndex: number;
  total: number;
  description: string;
  status: "running" | "passed" | "failed" | "skipped";
}

export interface ExecutorCallbacks {
  onStep: (step: RunStep) => void | Promise<void>;
  onComplete: (summary: Record<string, unknown>) => void | Promise<void>;
  onError: (error: string) => void | Promise<void>;
}

const SIMULATED_STEPS = [
  "Navigating to target URL",
  "Checking page load performance",
  "Validating navigation links",
  "Testing form inputs",
  "Checking responsive layout",
  "Verifying API responses",
  "Checking accessibility (a11y)",
  "Testing authentication flows",
  "Scanning for console errors",
  "Generating test summary",
];

export async function executeRun(
  targetUrl: string,
  mode: "full" | "targeted",
  instructions: string | null,
  callbacks: ExecutorCallbacks
): Promise<void> {
  const steps = mode === "full" ? SIMULATED_STEPS : SIMULATED_STEPS.slice(0, 4);
  const total = steps.length;

  try {
    for (let i = 0; i < steps.length; i++) {
      await delay(800 + Math.random() * 600);
      const passed = Math.random() > 0.15;
      await callbacks.onStep({
        stepIndex: i,
        total,
        description: steps[i],
        status: passed ? "passed" : "failed",
      });
    }

    await callbacks.onComplete({
      targetUrl,
      mode,
      totalSteps: total,
      passedSteps: Math.round(total * 0.85),
      failedSteps: Math.round(total * 0.15),
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    await callbacks.onError(String(err));
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
