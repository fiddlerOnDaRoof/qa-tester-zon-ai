import { supabase } from "@/lib/supabaseClient";

export interface SignInResult {
  error: string | null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  return null;
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return { error: null };

    const msg = error.message.toLowerCase();

    if (
      msg.includes("invalid login") ||
      msg.includes("invalid credentials") ||
      msg.includes("email not confirmed") ||
      msg.includes("wrong password") ||
      msg.includes("user not found")
    ) {
      return { error: "Incorrect email or password. Please try again." };
    }

    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return { error: "Too many attempts. Please wait a moment and try again." };
    }

    return { error: "Something went wrong. Please try again." };
  } catch {
    return { error: "Network error. Please check your connection and retry." };
  }
}
