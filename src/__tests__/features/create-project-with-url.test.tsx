/**
 * Create project with URL — component + validation tests.
 *
 * Test cases:
 *  1. Create a project with valid name and URL → project is saved and
 *     appears in the project list.
 *  2. Attempt to create a project with missing name or invalid URL →
 *     validation prevents submission and shows actionable errors.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mock factories — declared before vi.mock() calls
// ---------------------------------------------------------------------------
const {
  mockMutate,
  mockReset,
  mockUseCreateProject,
  mockUseProjects,
  mockSetSelectedProjectId,
} = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockReset: vi.fn(),
  mockUseCreateProject: vi.fn(),
  mockUseProjects: vi.fn(),
  mockSetSelectedProjectId: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Zustand store
vi.mock("@/store/appStore", () => ({
  useAppStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    const state = {
      selectedProjectId: null,
      setSelectedProjectId: mockSetSelectedProjectId,
    };
    return selector ? selector(state) : state;
  },
}));

// Feature hooks — mocked so we control exact state per test
vi.mock(
  "@/src/features/create-project-with-url/lib/hooks",
  () => ({
    useCreateProject: (...a: unknown[]) => mockUseCreateProject(...a),
    useProjects: (...a: unknown[]) => mockUseProjects(...a),
    PROJECTS_KEY: ["projects"],
  })
);

// ---------------------------------------------------------------------------
// Components under test (imported after mocks)
// ---------------------------------------------------------------------------
import NewProjectModal from "@/src/features/create-project-with-url/components/NewProjectModal";
import ProjectList from "@/src/features/create-project-with-url/components/ProjectList";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Configures default mock return values. */
function setupDefaultMocks(overrides?: {
  projects?: Array<{
    id: string;
    user_id: string;
    name: string;
    target_url: string;
    created_at: string;
    updated_at: string;
  }>;
  isPending?: boolean;
  isError?: boolean;
  errorMessage?: string;
  loadingProjects?: boolean;
}) {
  const {
    projects = [],
    isPending = false,
    isError = false,
    errorMessage = "",
    loadingProjects = false,
  } = overrides ?? {};

  mockUseProjects.mockReturnValue({
    data: projects,
    isLoading: loadingProjects,
    error: null,
  });

  mockUseCreateProject.mockReturnValue({
    mutate: mockMutate,
    isPending,
    isError,
    error: isError ? new Error(errorMessage) : null,
    reset: mockReset,
  });
}

const noop = () => {};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Create project with URL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // Test case 1: Create a project with valid name and URL
  // =========================================================================
  it("creates a project with valid name and URL, saves it, and it appears in the project list", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    // Simulate: after mutation succeeds the project appears in the list
    const createdProject = {
      id: "proj-1",
      user_id: "user-1",
      name: "My App",
      target_url: "https://example.com",
      created_at: "2025-06-01T00:00:00Z",
      updated_at: "2025-06-01T00:00:00Z",
    };

    // When mutate is called, invoke the onSuccess callback to simulate a
    // successful API response.
    mockMutate.mockImplementation(
      (
        _input: unknown,
        opts?: { onSuccess?: (project: typeof createdProject) => void }
      ) => {
        opts?.onSuccess?.(createdProject);
      }
    );

    setupDefaultMocks();

    // --- Part A: Modal form submission ---
    render(<NewProjectModal open={true} onClose={onClose} />);

    // Fill in valid name and URL
    const nameInput = screen.getByLabelText(/project name/i);
    const urlInput = screen.getByLabelText(/target url/i);

    await user.type(nameInput, "My App");
    await user.type(urlInput, "https://example.com");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create project/i }));

    // mutate was called with validated data
    expect(mockMutate).toHaveBeenCalledTimes(1);
    const [mutateArg] = mockMutate.mock.calls[0];
    expect(mutateArg).toEqual({
      name: "My App",
      target_url: "https://example.com",
    });

    // Modal closed after successful creation (onClose called)
    expect(onClose).toHaveBeenCalled();

    // No validation error messages visible
    expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/valid url/i)).not.toBeInTheDocument();

    // --- Part B: Project appears in the project list ---
    setupDefaultMocks({ projects: [createdProject] });

    const { unmount } = render(<ProjectList onNewProject={noop} />);

    // The newly created project is visible in the list
    expect(screen.getByText("My App")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();

    unmount();
  });

  // =========================================================================
  // Test case 2: Validation prevents submission with missing name / invalid URL
  // =========================================================================
  it("shows validation errors and prevents submission when name is missing or URL is invalid", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    setupDefaultMocks();

    render(<NewProjectModal open={true} onClose={onClose} />);

    // --- Sub-case A: Submit with completely empty fields ---
    await user.click(screen.getByRole("button", { name: /create project/i }));

    // Inline validation errors are shown
    expect(
      screen.getByText("Project name is required")
    ).toBeInTheDocument();
    expect(screen.getByText("URL is required")).toBeInTheDocument();

    // mutate was NOT called — no network request
    expect(mockMutate).not.toHaveBeenCalled();

    // Modal stays open
    expect(onClose).not.toHaveBeenCalled();

    // --- Sub-case B: Fill valid name but provide an invalid URL ---
    const nameInput = screen.getByLabelText(/project name/i);
    const urlInput = screen.getByLabelText(/target url/i);

    await user.type(nameInput, "Test Project");
    await user.type(urlInput, "not a valid url");

    await user.click(screen.getByRole("button", { name: /create project/i }));

    // Name error should be gone, but URL error should appear
    expect(
      screen.queryByText("Project name is required")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid URL (e.g. https://example.com)")
    ).toBeInTheDocument();

    // mutate is still not called
    expect(mockMutate).not.toHaveBeenCalled();

    // --- Sub-case C: Clear name, keep invalid URL → both errors ---
    await user.clear(nameInput);
    await user.clear(urlInput);
    await user.type(urlInput, "not a valid url");
    await user.click(screen.getByRole("button", { name: /create project/i }));

    expect(
      screen.getByText("Project name is required")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid URL (e.g. https://example.com)")
    ).toBeInTheDocument();

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
