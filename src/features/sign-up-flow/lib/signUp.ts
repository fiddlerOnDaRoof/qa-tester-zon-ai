import { supabase } from "@/lib/supabaseClient";

export interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address";
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (!name.trim()) return "Display name is required";
  if (name.trim().length < 2) return "Display name must be at least 2 characters";
  return null;
}

export function validateSignUpPassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  displayName: string
): Promise<SignUpResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("user already exists")) {
        return {
          error: "An account with this email already exists. Try signing in instead.",
          needsEmailConfirmation: false,
        };
      }
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return {
          error: "Too many attempts. Please wait a moment and try again.",
          needsEmailConfirmation: false,
        };
      }
      return {
        error: "Something went wrong. Please try again.",
        needsEmailConfirmation: false,
      };
    }

    // user present but no session → Supabase requires email confirmation
    const needsEmailConfirmation = !!data.user && !data.session;
    return { error: null, needsEmailConfirmation };
  } catch {
    return {
      error: "Network error. Please check your connection and retry.",
      needsEmailConfirmation: false,
    };
  }
}
