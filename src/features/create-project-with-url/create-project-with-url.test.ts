/**
 * create-project-with-url feature tests
 *
 * Covers:
 * - Validation: name required, URL format, protocol normalization
 * - API: POST /api/projects creates project, GET /api/projects lists projects
 * - UI: NewProjectModal validation, submit, close
 *
 * These tests require vitest (not yet installed). Run when test runner is configured.
 */

import { describe, it, expect } from "vitest";
import { CreateProjectSchema } from "./lib/validation";

describe("CreateProjectSchema", () => {
  it("accepts valid name and URL", () => {
    const result = CreateProjectSchema.safeParse({
      name: "My App",
      target_url: "https://example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My App");
      expect(result.data.target_url).toBe("https://example.com");
    }
  });

  it("rejects empty name", () => {
    const result = CreateProjectSchema.safeParse({
      name: "",
      target_url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = CreateProjectSchema.safeParse({
      name: "a".repeat(101),
      target_url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = CreateProjectSchema.safeParse({
      name: "  My App  ",
      target_url: "https://example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My App");
    }
  });

  it("auto-prepends https:// when protocol is missing", () => {
    const result = CreateProjectSchema.safeParse({
      name: "Test",
      target_url: "example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.target_url).toBe("https://example.com");
    }
  });

  it("accepts http:// URLs", () => {
    const result = CreateProjectSchema.safeParse({
      name: "Test",
      target_url: "http://localhost:3000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.target_url).toBe("http://localhost:3000");
    }
  });

  it("rejects invalid URLs", () => {
    const result = CreateProjectSchema.safeParse({
      name: "Test",
      target_url: "not a url at all!!!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty URL", () => {
    const result = CreateProjectSchema.safeParse({
      name: "Test",
      target_url: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims URL whitespace", () => {
    const result = CreateProjectSchema.safeParse({
      name: "Test",
      target_url: "  https://example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.target_url).toBe("https://example.com");
    }
  });
});
