import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateEmail,
  validateDisplayName,
  validateSignUpPassword,
  validateConfirmPassword,
  signUpWithEmailPassword,
} from "./lib/signUp";

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
describe("validateEmail", () => {
  it("returns error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
  });
  it("returns error for invalid format", () => {
    expect(validateEmail("notanemail")).toBe("Please enter a valid email address");
  });
  it("returns null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });
});

describe("validateDisplayName", () => {
  it("returns error for empty name", () => {
    expect(validateDisplayName("")).toBe("Display name is required");
  });
  it("returns error for single character", () => {
    expect(validateDisplayName("A")).toBe("Display name must be at least 2 characters");
  });
  it("returns null for valid name", () => {
    expect(validateDisplayName("Alice")).toBeNull();
  });
});

describe("validateSignUpPassword", () => {
  it("returns error for empty password", () => {
    expect(validateSignUpPassword("")).toBe("Password is required");
  });
  it("returns error for password shorter than 8 characters", () => {
    expect(validateSignUpPassword("short")).toBe("Password must be at least 8 characters");
  });
  it("returns null for password with 8+ characters", () => {
    expect(validateSignUpPassword("secure12")).toBeNull();
  });
});

describe("validateConfirmPassword", () => {
  it("returns error when confirm is empty", () => {
    expect(validateConfirmPassword("abc12345", "")).toBe(
      "Please confirm your password"
    );
  });
  it("returns error when passwords do not match", () => {
    expect(validateConfirmPassword("abc12345", "different")).toBe(
      "Passwords do not match"
    );
  });
  it("returns null when passwords match", () => {
    expect(validateConfirmPassword("abc12345", "abc12345")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signUpWithEmailPassword
// ---------------------------------------------------------------------------
const { mockSignUp } = vi.hoisted(() => ({ mockSignUp: vi.fn() }));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
    },
  },
}));

describe("signUpWithEmailPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns needsEmailConfirmation=true when user exists but no session", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "u1" }, session: null },
      error: null,
    });
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toBeNull();
    expect(result.needsEmailConfirmation).toBe(true);
  });

  it("returns needsEmailConfirmation=false when session is returned (auto-confirm)", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "u1" }, session: { access_token: "tok" } },
      error: null,
    });
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toBeNull();
    expect(result.needsEmailConfirmation).toBe(false);
  });

  it("maps 'already registered' error", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toMatch(/already exists/i);
  });

  it("maps rate limit error", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "rate limit exceeded: too many requests" },
    });
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toMatch(/too many attempts/i);
  });

  it("returns generic error for unknown failure", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "internal server error" },
    });
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toBe("Something went wrong. Please try again.");
  });

  it("returns network error when an exception is thrown", async () => {
    mockSignUp.mockRejectedValue(new Error("fetch failed"));
    const result = await signUpWithEmailPassword("a@b.com", "password1", "Alice");
    expect(result.error).toMatch(/network error/i);
  });
});
