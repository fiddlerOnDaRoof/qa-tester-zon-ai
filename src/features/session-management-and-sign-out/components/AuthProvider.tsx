"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/appStore";

/**
 * Listens for Supabase auth state changes and syncs sign-out across tabs.
 * When a SIGNED_OUT event fires (even from another tab), clears React Query
 * cache, resets Zustand store, and redirects to /login.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const reset = useAppStore((s) => s.reset);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        reset();
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, queryClient, reset]);

  return <>{children}</>;
}
