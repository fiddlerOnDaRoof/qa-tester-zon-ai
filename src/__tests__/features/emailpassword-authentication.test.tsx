/**
 * Email/Password Authentication — integration tests for LoginForm component.
 *
 * Test cases:
 *  1. Sign in with valid credentials → user is authenticated and routed to /home
 *  2. Sign in with invalid credentials → error banner shown, user stays on /login
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mock factories — must be declared before vi.mock() calls
// ---------------------------------------------------------------------------
const { mockReplace, mockSignInWithPassword } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockSignInWithPassword: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock Supabase client
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

// ---------------------------------------------------------------------------
// Component under test (imported after mocks)
// ---------------------------------------------------------------------------
import LoginForm from "@/src/features/emailpassword-authentication/components/LoginForm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_EMAIL = "tester@example.com";
const VALID_PASSWORD = "correctPassword1!";

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Email/Password Authentication — LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test case 1: valid credentials → authenticated & routed to /home
  it("authenticates the user and navigates to /home on valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { access_token: "tok_abc" } },
      error: null,
    });

    await fillAndSubmit(VALID_EMAIL, VALID_PASSWORD);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });
      // Authenticated user is redirected to the chat home
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });

    // No error banner should be visible
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Test case 2: invalid credentials → error shown, navigation blocked
  it("shows an error message and does not navigate on invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    await fillAndSubmit(VALID_EMAIL, "wrongPassword");

    await waitFor(() => {
      // Error banner must be visible
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/incorrect email or password/i);
    });

    // Navigation must NOT have been called — user stays on the login page
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
