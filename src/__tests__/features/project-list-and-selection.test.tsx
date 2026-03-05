/**
 * Project list and selection — component tests.
 *
 * Test case:
 *  1. Select a project from the project list → selected project context
 *     updates and the details panel shows the project's info (name, URL,
 *     runs list).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mock factories
// ---------------------------------------------------------------------------
const {
  mockUseProjects,
  mockSetSelectedProjectId,
  mockUseProjectRuns,
  mockUseCreateRun,
  mockSelectedProjectId,
} = vi.hoisted(() => ({
  mockUseProjects: vi.fn(),
  mockSetSelectedProjectId: vi.fn(),
  mockUseProjectRuns: vi.fn(),
  mockUseCreateRun: vi.fn(),
  mockSelectedProjectId: { value: null as string | null },
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Zustand store — tracks selectedProjectId in a mutable ref so the
// component re-renders with the updated value after setSelectedProjectId.
vi.mock("@/store/appStore", () => ({
  useAppStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state: Record<string, unknown> = {
      selectedProjectId: mockSelectedProjectId.value,
      setSelectedProjectId: mockSetSelectedProjectId,
    };
    return selector ? selector(state) : state;
  },
}));

// create-project-with-url hooks (used by ProjectsView → ProjectList)
vi.mock("@/src/features/create-project-with-url/lib/hooks", () => ({
  useCreateProject: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
  useProjects: (...a: unknown[]) => mockUseProjects(...a),
  PROJECTS_KEY: ["projects"],
}));

// project-list-and-selection hooks (used by ProjectDetail)
vi.mock("@/src/features/project-list-and-selection/lib/hooks", () => ({
  useProjectRuns: (...a: unknown[]) => mockUseProjectRuns(...a),
  useCreateRun: (...a: unknown[]) => mockUseCreateRun(...a),
  RUNS_KEY: (id: string) => ["runs", id],
}));

// ---------------------------------------------------------------------------
// Components under test (imported after mocks)
// ---------------------------------------------------------------------------
import ProjectsView from "@/src/features/project-list-and-selection/components/ProjectsView";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const PROJECT_A = {
  id: "proj-a",
  user_id: "user-1",
  name: "Alpha App",
  target_url: "https://alpha.example.com",
  created_at: "2025-06-01T00:00:00Z",
  updated_at: "2025-06-01T00:00:00Z",
};

const PROJECT_B = {
  id: "proj-b",
  user_id: "user-1",
  name: "Beta App",
  target_url: "https://beta.example.com",
  created_at: "2025-06-02T00:00:00Z",
  updated_at: "2025-06-02T00:00:00Z",
};

const RUNS_B = [
  {
    id: "run-1",
    project_id: "proj-b",
    user_id: "user-1",
    mode: "full" as const,
    instructions: null,
    status: "completed" as const,
    progress_json: null,
    summary_json: null,
    error_text: null,
    started_at: "2025-06-03T10:00:00Z",
    finished_at: "2025-06-03T10:05:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupMocks(overrides?: {
  selectedId?: string | null;
  projects?: typeof PROJECT_A[];
  runs?: typeof RUNS_B;
  runsLoading?: boolean;
}) {
  const {
    selectedId = null,
    projects = [PROJECT_A, PROJECT_B],
    runs = [],
    runsLoading = false,
  } = overrides ?? {};

  mockSelectedProjectId.value = selectedId;

  mockUseProjects.mockReturnValue({
    data: projects,
    isLoading: false,
    error: null,
  });

  mockUseProjectRuns.mockReturnValue({
    data: runs,
    isLoading: runsLoading,
    error: null,
  });

  mockUseCreateRun.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Project list and selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedProjectId.value = null;
  });

  // =========================================================================
  // Test case 1: Select a project from the project list
  // =========================================================================
  it("selects a project, updates context, and shows project details with runs", async () => {
    const user = userEvent.setup();

    // --- Phase 1: No project selected — empty state shown ---
    setupMocks({ selectedId: null });

    const { unmount } = render(<ProjectsView />);

    // Both projects should be listed in the sidebar
    expect(screen.getByText("Alpha App")).toBeInTheDocument();
    expect(screen.getByText("Beta App")).toBeInTheDocument();

    // Empty state is shown when nothing is selected
    expect(
      screen.getByText("Welcome to Project Testing")
    ).toBeInTheDocument();

    // Detail heading for either project should NOT be visible yet
    expect(screen.queryByRole("heading", { name: "Alpha App", level: 1 })).not.toBeInTheDocument();

    // --- Phase 2: Click the second project ---
    // The project names in the sidebar are rendered as buttons
    const betaButton = screen.getAllByRole("button").find(
      (btn) => within(btn).queryByText("Beta App") !== null
    )!;
    expect(betaButton).toBeDefined();

    await user.click(betaButton);

    // setSelectedProjectId should have been called with the second project's id
    expect(mockSetSelectedProjectId).toHaveBeenCalledWith("proj-b");

    unmount();

    // --- Phase 3: Re-render with selectedProjectId set to proj-b ---
    // Simulates the Zustand state update causing a re-render.
    setupMocks({ selectedId: "proj-b", runs: RUNS_B });

    const { unmount: unmount2 } = render(<ProjectsView />);

    // Project detail panel should now show the selected project
    expect(screen.getByRole("heading", { name: "Beta App", level: 1 })).toBeInTheDocument();

    // Target URL hostname should be visible (appears in sidebar + detail panel)
    const hostnameElements = screen.getAllByText("beta.example.com");
    expect(hostnameElements.length).toBeGreaterThanOrEqual(2);

    // The empty state should be gone
    expect(
      screen.queryByText("Welcome to Project Testing")
    ).not.toBeInTheDocument();

    // Runs table heading should be present
    expect(screen.getByText("Test Runs")).toBeInTheDocument();

    // The completed run should be visible (badge + table row)
    const completedElements = screen.getAllByText("Completed");
    expect(completedElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Full scan")).toBeInTheDocument();

    // useProjectRuns should have been called with the selected project id
    expect(mockUseProjectRuns).toHaveBeenCalledWith("proj-b");

    unmount2();
  });
});
