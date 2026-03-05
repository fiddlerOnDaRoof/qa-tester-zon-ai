import { describe, it, expect, vi, beforeEach } from "vitest";
import { signOut } from "./lib/signOut";

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------
const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: mockSignOut,
    },
  },
}));

// ---------------------------------------------------------------------------
// signOut()
// ---------------------------------------------------------------------------
describe("signOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null error on successful sign-out", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const result = await signOut();
    expect(result.error).toBeNull();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("returns the Supabase error message when sign-out fails", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "Session not found" } });
    const result = await signOut();
    expect(result.error).toBe("Session not found");
  });

  it("returns a generic message when an unexpected exception is thrown", async () => {
    mockSignOut.mockRejectedValue(new Error("network timeout"));
    const result = await signOut();
    expect(result.error).toBe("Sign out failed. Please try again.");
  });
});
