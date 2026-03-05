import { supabase } from "@/lib/supabaseClient";

export interface SignOutResult {
  error: string | null;
}

export async function signOut(): Promise<SignOutResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "Sign out failed. Please try again." };
  }
}
