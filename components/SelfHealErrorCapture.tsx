"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const PROJECT_PREFIX = "qa_tester_zon_ai_";

/**
 * Fire-and-forget: captures uncaught frontend errors and unhandled
 * promise rejections into the shared incubator_self_heal_errors table.
 * Mount once at the Providers level.
 */
export default function SelfHealErrorCapture() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      supabase
        .from("incubator_self_heal_errors")
        .insert({
          category: "frontend",
          project_prefix: PROJECT_PREFIX,
          source: event.filename ?? "unknown",
          error_message: event.message,
          error_stack: event.error?.stack ?? null,
          metadata: {
            lineno: event.lineno,
            colno: event.colno,
            url: window.location.href,
            component: "QATesterZonAI",
          },
        })
        .then(() => {})
        .catch(() => {});
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const r = event.reason;
      supabase
        .from("incubator_self_heal_errors")
        .insert({
          category: "frontend",
          project_prefix: PROJECT_PREFIX,
          source: "unhandledrejection",
          error_message: r?.message ?? String(r),
          error_stack: r?.stack ?? null,
          metadata: {
            url: window.location.href,
            component: "QATesterZonAI",
          },
        })
        .then(() => {})
        .catch(() => {});
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
