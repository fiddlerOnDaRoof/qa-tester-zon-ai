/**
 * Chat with QA Tester AI — component tests for ChatView.
 *
 * Test cases:
 *  1. Send a chat message and receive a response → user message appears,
 *     send is invoked, and assistant response renders in the thread.
 *  2. Handle AI/chat backend error → error banner shown, user can dismiss
 *     and retry without losing conversation context.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Hoisted mock factories — must be declared before vi.mock() calls
// ---------------------------------------------------------------------------
const {
  mockSend,
  mockClearError,
  mockSetActiveConversationId,
  mockMutate,
  mockUseConversations,
  mockUseMessages,
  mockUseSendMessage,
  mockUseCreateConversation,
} = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockClearError: vi.fn(),
  mockSetActiveConversationId: vi.fn(),
  mockMutate: vi.fn(),
  mockUseConversations: vi.fn(),
  mockUseMessages: vi.fn(),
  mockUseSendMessage: vi.fn(),
  mockUseCreateConversation: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Zustand store
vi.mock("@/store/appStore", () => ({
  useAppStore: () => ({
    activeConversationId: "conv-1",
    setActiveConversationId: mockSetActiveConversationId,
  }),
}));

// Chat hooks — mocked so we can control exact state per test
vi.mock("@/src/features/chat-with-qa-tester-ai/lib/hooks", () => ({
  useConversations: (...a: unknown[]) => mockUseConversations(...a),
  useCreateConversation: (...a: unknown[]) => mockUseCreateConversation(...a),
  useMessages: (...a: unknown[]) => mockUseMessages(...a),
  useSendMessage: (...a: unknown[]) => mockUseSendMessage(...a),
}));

// ---------------------------------------------------------------------------
// Component under test (imported after mocks)
// ---------------------------------------------------------------------------
import ChatView from "@/src/features/chat-with-qa-tester-ai/components/ChatView";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setupDefaultMocks(overrides?: {
  messages?: Array<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
    meta_json: Record<string, unknown> | null;
  }>;
  isStreaming?: boolean;
  streamingContent?: string;
  error?: string | null;
  loadingConvos?: boolean;
  loadingMessages?: boolean;
}) {
  const {
    messages = [],
    isStreaming = false,
    streamingContent = "",
    error = null,
    loadingConvos = false,
    loadingMessages = false,
  } = overrides ?? {};

  mockUseConversations.mockReturnValue({
    data: [
      {
        id: "conv-1",
        user_id: "user-1",
        title: "Test Conversation",
        created_at: "2025-01-01T00:00:00Z",
      },
    ],
    isLoading: loadingConvos,
  });

  mockUseCreateConversation.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  });

  mockUseMessages.mockReturnValue({
    data: messages,
    isLoading: loadingMessages,
  });

  mockUseSendMessage.mockReturnValue({
    send: mockSend,
    isStreaming,
    streamingContent,
    error,
    clearError: mockClearError,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Chat with QA Tester AI — ChatView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // Test case 1: Send a chat message and receive a response
  // =========================================================================
  it("sends a chat message and displays both user and assistant messages in the thread", async () => {
    const user = userEvent.setup();

    // Render with a conversation that already has a user message + assistant reply
    setupDefaultMocks({
      messages: [
        {
          id: "msg-1",
          conversation_id: "conv-1",
          role: "user",
          content: "Hello, can you help me test my app?",
          created_at: "2025-01-01T10:00:00Z",
          meta_json: null,
        },
        {
          id: "msg-2",
          conversation_id: "conv-1",
          role: "assistant",
          content: "Of course! What features would you like me to test?",
          created_at: "2025-01-01T10:00:05Z",
          meta_json: null,
        },
      ],
    });

    render(<ChatView />);

    // Both user and assistant messages are visible in the thread
    expect(
      screen.getByText("Hello, can you help me test my app?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Of course! What features would you like me to test?")
    ).toBeInTheDocument();

    // Assistant label is rendered
    expect(screen.getByText("QA TESTER AI")).toBeInTheDocument();

    // User types a new message and sends it
    const textarea = screen.getByPlaceholderText(/message qa tester ai/i);
    await user.type(textarea, "Test the signup flow please");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    // send() is invoked with the typed content
    expect(mockSend).toHaveBeenCalledWith("Test the signup flow please");
    // clearError is called before sending (handleSend behaviour)
    expect(mockClearError).toHaveBeenCalled();
    // Textarea is cleared after sending
    expect(textarea).toHaveValue("");
  });

  // =========================================================================
  // Test case 2: Handle AI/chat backend error while sending a message
  // =========================================================================
  it("displays a recoverable error state and allows retry without losing conversation context", async () => {
    const user = userEvent.setup();

    // Render with an existing message + an error from a failed send
    setupDefaultMocks({
      messages: [
        {
          id: "msg-1",
          conversation_id: "conv-1",
          role: "user",
          content: "Run my test suite",
          created_at: "2025-01-01T10:00:00Z",
          meta_json: null,
        },
      ],
      error: "Failed to send message",
    });

    render(<ChatView />);

    // Error banner is visible
    expect(screen.getByText("Failed to send message")).toBeInTheDocument();

    // The earlier user message is still visible (context preserved)
    expect(screen.getByText("Run my test suite")).toBeInTheDocument();

    // User dismisses the error
    await user.click(screen.getByText("Dismiss"));
    expect(mockClearError).toHaveBeenCalled();

    // User retries by sending a new message
    const textarea = screen.getByPlaceholderText(/message qa tester ai/i);
    await user.type(textarea, "Try again");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    // send() is called again — retry works
    expect(mockSend).toHaveBeenCalledWith("Try again");
  });
});
