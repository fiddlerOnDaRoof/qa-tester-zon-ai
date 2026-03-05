import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEmail, validatePassword, signInWithEmailPassword } from "./lib/auth";

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe("validateEmail", () => {
  it("returns error for empty string", () => {
    expect(validateEmail("")).toBe("Email is required");
  });

  it("returns error for whitespace-only string", () => {
    expect(validateEmail("   ")).toBe("Email is required");
  });

  it("returns error for missing @", () => {
    expect(validateEmail("notanemail")).toBe("Please enter a valid email address");
  });

  it("returns error for missing domain", () => {
    expect(validateEmail("user@")).toBe("Please enter a valid email address");
  });

  it("returns null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("returns null for email with subdomain", () => {
    expect(validateEmail("user@mail.example.co.uk")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validatePassword
// ---------------------------------------------------------------------------
describe("validatePassword", () => {
  it("returns error for empty string", () => {
    expect(validatePassword("")).toBe("Password is required");
  });

  it("returns null for any non-empty string", () => {
    expect(validatePassword("secret")).toBeNull();
  });

  it("returns null for single character", () => {
    expect(validatePassword("x")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signInWithEmailPassword
// ---------------------------------------------------------------------------
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabaseClient";

const mockSignIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;

describe("signInWithEmailPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null error on successful sign-in", async () => {
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null });
    const result = await signInWithEmailPassword("user@example.com", "pass");
    expect(result.error).toBeNull();
  });

  it("maps invalid credentials error", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });
    const result = await signInWithEmailPassword("user@example.com", "wrong");
    expect(result.error).toBe("Incorrect email or password. Please try again.");
  });

  it("maps rate limit error", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: "Rate limit exceeded: too many requests" },
    });
    const result = await signInWithEmailPassword("user@example.com", "pass");
    expect(result.error).toMatch(/too many attempts/i);
  });

  it("maps network/throw error", async () => {
    mockSignIn.mockRejectedValue(new Error("fetch failed"));
    const result = await signInWithEmailPassword("user@example.com", "pass");
    expect(result.error).toMatch(/network error/i);
  });

  it("returns generic message for unknown error", async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: "Some unexpected server error" },
    });
    const result = await signInWithEmailPassword("user@example.com", "pass");
    expect(result.error).toBe("Something went wrong. Please try again.");
  });
});
