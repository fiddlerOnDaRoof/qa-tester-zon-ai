import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignUpForm from "@/src/features/sign-up-flow/components/SignUpForm";

export const metadata = {
  title: "Create Account — QA Tester Zon AI",
};

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/home");

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #0a150a 0%, #0d1a0d 50%, #111d0e 100%)" }}
    >
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#29422b 1px, transparent 1px), linear-gradient(90deg, #29422b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-[420px]">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -inset-4 rounded-3xl opacity-20 blur-2xl"
          style={{ background: "radial-gradient(ellipse at center, #29422b, transparent 70%)" }}
        />

        {/* Auth card */}
        <div
          className="relative rounded-2xl border border-[#29422b]/50 px-8 py-10"
          style={{
            background: "linear-gradient(145deg, #182318, #131e13)",
            boxShadow:
              "8px 8px 20px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #29422b, #5b600b)",
                boxShadow: "0 0 20px rgba(41,66,43,0.5), 3px 3px 8px rgba(0,0,0,0.4)",
              }}
            >
              <svg
                className="h-6 w-6 text-[#c8e8c8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold tracking-tight text-[#d8f0d8]"
              style={{ textShadow: "0 0 20px rgba(41,66,43,0.6)" }}
            >
              Create account
            </h1>
            <p className="mt-1.5 text-sm text-[#5a805a]">
              Join your AI-powered QA command center
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-6 h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, #29422b, transparent)",
            }}
          />

          <SignUpForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#3a5a3a]">
          Secure sign-up via Supabase Auth
        </p>
      </div>
    </div>
  );
}
