import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AuthProvider from "@/src/features/session-management-and-sign-out/components/AuthProvider";
import UserMenu from "@/src/features/session-management-and-sign-out/components/UserMenu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AuthProvider>
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "linear-gradient(160deg, #0a150a 0%, #0d1a0d 60%, #0e1a0e 100%)" }}
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#29422b 1px, transparent 1px), linear-gradient(90deg, #29422b 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top nav */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between border-b border-[#29422b]/30 px-4 py-3 sm:px-6"
          style={{
            background: "rgba(13,26,13,0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 1px 0 rgba(41,66,43,0.2), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Brand + nav links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Logo mark */}
            <div
              className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, #29422b, #5b600b)",
                boxShadow: "0 0 12px rgba(41,66,43,0.5)",
              }}
            >
              <svg
                className="h-4 w-4 text-[#c8e8c8]"
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

            <Link
              href="/home"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#7ab07a] transition-colors hover:bg-[#29422b]/20 hover:text-[#c8e8c8]"
            >
              Tester
            </Link>
            <Link
              href="/projects"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#7ab07a] transition-colors hover:bg-[#29422b]/20 hover:text-[#c8e8c8]"
            >
              Projects
            </Link>
          </nav>

          {/* Right side: user menu */}
          <UserMenu userEmail={user.email ?? "user"} />
        </header>

        <main className="relative flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
