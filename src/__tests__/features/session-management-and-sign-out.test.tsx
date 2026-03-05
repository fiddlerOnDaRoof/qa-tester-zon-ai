/**
 * Session Management and Sign Out — component tests
 *
 * Test cases:
 *  1. Session persists after browser refresh — AuthProvider does NOT redirect
 *     when the session is still valid (TOKEN_REFRESHED / SIGNED_IN events).
 *  2. Sign out clears session and redirects to /login — UserMenu sign-out flow
 *     calls signOut(), clears React Query cache, resets Zustand store, and
 *     navigates to /login.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mock primitives (available inside vi.mock() factories)
// ---------------------------------------------------------------------------
const {
  mockReplace,
  mockQueryClear,
  mockStoreReset,
  mockSignOutFn,
  mockUnsubscribe,
  authCapture,
} = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockQueryClear: vi.fn(),
  mockStoreReset: vi.fn(),
  mockSignOutFn: vi.fn(),
  mockUnsubscribe: vi.fn(),
  // Mutable container so we can capture the onAuthStateChange callback
  authCapture: { callback: null as ((event: string) => void) | null },
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock(
  "@/src/features/session-management-and-sign-out/lib/signOut",
  () => ({ signOut: mockSignOutFn })
);

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear: mockQueryClear }),
}));

vi.mock("@/store/appStore", () => ({
  useAppStore: (selector: (s: { reset: () => void }) => unknown) =>
    selector({ reset: mockStoreReset }),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string) => void) => {
        authCapture.callback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    },
  },
}));

// ---------------------------------------------------------------------------
// Components under test (imported after mocks are registered)
// ---------------------------------------------------------------------------
import AuthProvider from "@/src/features/session-management-and-sign-out/components/AuthProvider";
import UserMenu from "@/src/features/session-management-and-sign-out/components/UserMenu";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Session Management and Sign Out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authCapture.callback = null;
  });

  // ── Test case 1: session persists after browser refresh ──────────────────
  it(
    "session persists after refresh — no redirect when auth state is still active",
    async () => {
      render(<AuthProvider>protected content</AuthProvider>);

      // The component should render children normally
      expect(screen.getByText("protected content")).toBeInTheDocument();

      // onAuthStateChange must have been subscribed
      expect(authCapture.callback).toBeTypeOf("function");

      // Simulate Supabase firing TOKEN_REFRESHED (what happens after a page reload
      // when the access token is stale but the refresh token is valid)
      act(() => {
        authCapture.callback!("TOKEN_REFRESHED");
      });

      // Also simulate SIGNED_IN (Supabase fires this when it successfully reads
      // an existing session from cookies on first load)
      act(() => {
        authCapture.callback!("SIGNED_IN");
      });

      // Neither event should trigger a redirect — session is still alive
      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalled();
      });

      // Query cache and store must be untouched
      expect(mockQueryClear).not.toHaveBeenCalled();
      expect(mockStoreReset).not.toHaveBeenCalled();
    }
  );

  // ── Test case 2: sign out clears session and redirects to /login ─────────
  it(
    "sign out clears React Query cache, resets Zustand store, and redirects to /login",
    async () => {
      mockSignOutFn.mockResolvedValue({ error: null });

      const user = userEvent.setup();
      render(<UserMenu userEmail="tester@example.com" />);

      // Avatar initial should be visible
      expect(screen.getByText("T")).toBeInTheDocument();

      // Click the sign-out button
      await user.click(screen.getByRole("button", { name: /sign out/i }));

      await waitFor(() => {
        // 1. Supabase session terminated
        expect(mockSignOutFn).toHaveBeenCalledOnce();
        // 2. React Query server-state cache wiped
        expect(mockQueryClear).toHaveBeenCalledOnce();
        // 3. Zustand client-state reset
        expect(mockStoreReset).toHaveBeenCalledOnce();
        // 4. User sent to login; protected pages no longer reachable
        expect(mockReplace).toHaveBeenCalledWith("/login");
      });
    }
  );

  // ── Bonus regression: cross-tab sign-out via AuthProvider ────────────────
  it(
    "cross-tab sign out — SIGNED_OUT event clears cache and redirects in current tab",
    async () => {
      render(<AuthProvider>app content</AuthProvider>);

      // Simulate another tab calling supabase.auth.signOut(), which broadcasts
      // the SIGNED_OUT event to all tabs via onAuthStateChange
      act(() => {
        authCapture.callback!("SIGNED_OUT");
      });

      await waitFor(() => {
        expect(mockQueryClear).toHaveBeenCalledOnce();
        expect(mockStoreReset).toHaveBeenCalledOnce();
        expect(mockReplace).toHaveBeenCalledWith("/login");
      });
    }
  );
});
