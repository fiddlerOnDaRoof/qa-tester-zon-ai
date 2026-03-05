"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signUpWithEmailPassword,
  validateEmail,
  validateDisplayName,
  validateSignUpPassword,
  validateConfirmPassword,
} from "../lib/signUp";

type FieldErrors = {
  email?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
};

// ---------------------------------------------------------------------------
// Success state shown after email-confirmation is sent
// ---------------------------------------------------------------------------
function ConfirmationSent({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #29422b, #5b600b)",
          boxShadow: "0 0 24px rgba(41,66,43,0.5), 3px 3px 10px rgba(0,0,0,0.4)",
        }}
      >
        <svg
          className="h-7 w-7 text-[#c8e8c8]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#d8f0d8]">Check your email</h2>
        <p className="mt-2 text-sm text-[#5a805a]">
          We sent a confirmation link to{" "}
          <span className="font-medium text-[#7ab07a]">{email}</span>.<br />
          Click the link to activate your account.
        </p>
      </div>
      <Link
        href="/login"
        className="mt-2 text-sm font-medium text-[#7ab07a] transition-colors hover:text-[#c8e8c8]"
      >
        Back to sign in
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------
export default function SignUpForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  if (confirmationEmail) return <ConfirmationSent email={confirmationEmail} />;

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      displayName: validateDisplayName(displayName) ?? undefined,
      password: validateSignUpPassword(password) ?? undefined,
      confirmPassword: validateConfirmPassword(password, confirmPassword) ?? undefined,
    };

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsLoading(true);

    try {
      const { error, needsEmailConfirmation } = await signUpWithEmailPassword(
        email.trim(),
        password,
        displayName.trim()
      );

      if (error) {
        setSubmitError(error);
        setPassword("");
        setConfirmPassword("");
      } else if (needsEmailConfirmation) {
        setConfirmationEmail(email.trim());
      } else {
        router.replace("/home");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "rounded-lg border border-[#2a3d2a] bg-[#111d11] px-4 py-3 text-sm text-[#d0f0d0] placeholder-[#3d5c3d] transition-colors focus:border-[#5b600b] focus:outline-none focus:ring-1 focus:ring-[#5b600b]/50 disabled:opacity-50";
  const inputShadow = {
    boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.03)",
  };
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7ab07a]";

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

      {/* Display name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className={labelClass}>
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => { setDisplayName(e.target.value); clearFieldError("displayName"); }}
          disabled={isLoading}
          placeholder="Your name"
          aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
          aria-invalid={!!fieldErrors.displayName}
          className={inputClass}
          style={inputShadow}
        />
        {fieldErrors.displayName && (
          <p id="displayName-error" className="text-xs text-red-400">
            {fieldErrors.displayName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
          disabled={isLoading}
          placeholder="you@example.com"
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={!!fieldErrors.email}
          className={inputClass}
          style={inputShadow}
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-xs text-red-400">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
          disabled={isLoading}
          placeholder="Min. 8 characters"
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          aria-invalid={!!fieldErrors.password}
          className={inputClass}
          style={inputShadow}
        />
        {fieldErrors.password && (
          <p id="password-error" className="text-xs text-red-400">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
          disabled={isLoading}
          placeholder="••••••••"
          aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
          aria-invalid={!!fieldErrors.confirmPassword}
          className={inputClass}
          style={inputShadow}
        />
        {fieldErrors.confirmPassword && (
          <p id="confirmPassword-error" className="text-xs text-red-400">
            {fieldErrors.confirmPassword}
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
            <span>Creating account…</span>
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Link to login */}
      <p className="text-center text-xs text-[#5a805a]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#7ab07a] transition-colors hover:text-[#c8e8c8]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
