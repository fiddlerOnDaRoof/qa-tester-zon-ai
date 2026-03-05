"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/appStore";
import { signOut } from "../lib/signOut";

interface UserMenuProps {
  userEmail: string;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const reset = useAppStore((s) => s.reset);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    queryClient.clear();
    reset();
    router.replace("/login");
  };

  return (
    <div className="flex items-center gap-3">
      {/* User identity */}
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#c8e8c8]"
          style={{
            background: "linear-gradient(135deg, #29422b, #5b600b)",
            boxShadow: "0 0 10px rgba(41,66,43,0.4), 2px 2px 6px rgba(0,0,0,0.4)",
          }}
          aria-hidden="true"
        >
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-xs text-[#5a805a] sm:block" title={userEmail}>
          {userEmail.length > 22 ? `${userEmail.slice(0, 20)}…` : userEmail}
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-[#29422b]" />

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-label="Sign out"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#7ab07a] transition-all duration-150 hover:text-[#c8e8c8] disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#29422b";
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(41,66,43,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        {isSigningOut ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border border-[#7ab07a] border-t-transparent" />
            <span>Signing out…</span>
          </>
        ) : (
          <>
            {/* logout icon */}
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign out</span>
          </>
        )}
      </button>
    </div>
  );
}
