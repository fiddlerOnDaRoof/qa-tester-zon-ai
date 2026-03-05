"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailPassword, validateEmail, validatePassword } from "../lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearFieldError = (field: "email" | "password") =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr ?? undefined, password: passErr ?? undefined });
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsLoading(true);

    try {
      const { error } = await signInWithEmailPassword(email, password);
      if (error) {
        setSubmitError(error);
        setPassword("");
      } else {
        router.replace("/home");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Error banner */}
      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          <span className="mt-0.5 shrink-0">⚠</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7ab07a]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          disabled={isLoading}
          placeholder="you@example.com"
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={!!fieldErrors.email}
          className="rounded-lg border border-[#2a3d2a] bg-[#111d11] px-4 py-3 text-sm text-[#d0f0d0] placeholder-[#3d5c3d] transition-colors focus:border-[#5b600b] focus:outline-none focus:ring-1 focus:ring-[#5b600b]/50 disabled:opacity-50"
          style={{
            boxShadow:
              "inset 2px 2px 6px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.03)",
          }}
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-xs text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7ab07a]"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          disabled={isLoading}
          placeholder="••••••••"
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          aria-invalid={!!fieldErrors.password}
          className="rounded-lg border border-[#2a3d2a] bg-[#111d11] px-4 py-3 text-sm text-[#d0f0d0] placeholder-[#3d5c3d] transition-colors focus:border-[#5b600b] focus:outline-none focus:ring-1 focus:ring-[#5b600b]/50 disabled:opacity-50"
          style={{
            boxShadow:
              "inset 2px 2px 6px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.03)",
          }}
        />
        {fieldErrors.password && (
          <p id="password-error" className="text-xs text-red-400">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 flex items-center justify-center gap-2.5 rounded-lg px-4 py-3.5 text-sm font-semibold tracking-wide text-[#c8e8c8] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #29422b 0%, #3a5e3a 100%)",
          boxShadow: isLoading
            ? "inset 2px 2px 6px rgba(0,0,0,0.4)"
            : "3px 3px 10px rgba(0,0,0,0.6), -1px -1px 5px rgba(255,255,255,0.06)",
        }}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#7ab07a] border-t-transparent" />
            <span>Signing in…</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Link to sign up */}
      <p className="text-center text-xs text-[#5a805a]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#7ab07a] transition-colors hover:text-[#c8e8c8]"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
