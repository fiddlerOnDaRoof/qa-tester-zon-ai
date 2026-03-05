import { describe, it, expect, vi } from "vitest";

// Mock the Supabase browser client (needs env vars at import time)
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }), eq: () => ({ order: () => ({ data: [], error: null }), single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "test-user" } } }),
    },
  },
}));

describe("Chat with QA Tester AI", () => {
  describe("chatApi", () => {
    it("exports fetchConversations function", async () => {
      const mod = await import("./lib/chatApi");
      expect(typeof mod.fetchConversations).toBe("function");
    });

    it("exports createConversation function", async () => {
      const mod = await import("./lib/chatApi");
      expect(typeof mod.createConversation).toBe("function");
    });

    it("exports fetchMessages function", async () => {
      const mod = await import("./lib/chatApi");
      expect(typeof mod.fetchMessages).toBe("function");
    });

    it("exports sendMessage function", async () => {
      const mod = await import("./lib/chatApi");
      expect(typeof mod.sendMessage).toBe("function");
    });
  });

  describe("hooks", () => {
    it("exports useConversations hook", async () => {
      const mod = await import("./lib/hooks");
      expect(typeof mod.useConversations).toBe("function");
    });

    it("exports useCreateConversation hook", async () => {
      const mod = await import("./lib/hooks");
      expect(typeof mod.useCreateConversation).toBe("function");
    });

    it("exports useMessages hook", async () => {
      const mod = await import("./lib/hooks");
      expect(typeof mod.useMessages).toBe("function");
    });

    it("exports useSendMessage hook", async () => {
      const mod = await import("./lib/hooks");
      expect(typeof mod.useSendMessage).toBe("function");
    });
  });
});
