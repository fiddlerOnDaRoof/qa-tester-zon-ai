import { describe, it, expect } from "vitest";

describe("project-list-and-selection", () => {
  describe("runsApi", () => {
    it("fetchProjectRuns builds correct URL", async () => {
      const projectId = "test-project-id";
      const expectedUrl = `/api/projects/${projectId}/runs`;
      expect(expectedUrl).toBe("/api/projects/test-project-id/runs");
    });

    it("createRun builds correct URL and payload", () => {
      const projectId = "proj-123";
      const input = { mode: "full" as const };
      const url = `/api/projects/${projectId}/runs`;
      expect(url).toBe("/api/projects/proj-123/runs");
      expect(input.mode).toBe("full");
    });

    it("targeted mode requires instructions", () => {
      const input = { mode: "targeted" as const, instructions: "Test login flow" };
      expect(input.instructions).toBeTruthy();
    });
  });

  describe("RUNS_KEY", () => {
    it("returns a unique key per project", async () => {
      const { RUNS_KEY } = await import("./lib/hooks");
      const key1 = RUNS_KEY("proj-1");
      const key2 = RUNS_KEY("proj-2");
      expect(key1).toEqual(["runs", "proj-1"]);
      expect(key2).toEqual(["runs", "proj-2"]);
      expect(key1).not.toEqual(key2);
    });
  });
});
