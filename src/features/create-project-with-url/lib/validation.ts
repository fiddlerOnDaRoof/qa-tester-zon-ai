import { z } from "zod";

/** Schema for creating a new project. */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be 100 characters or less")
    .transform((v) => v.trim()),
  target_url: z
    .string()
    .min(1, "URL is required")
    .transform((v) => {
      let url = v.trim();
      // Auto-prepend https:// if no protocol given
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      return url;
    })
    .refine(
      (v) => {
        try {
          const parsed = new URL(v);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL (e.g. https://example.com)" }
    ),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
