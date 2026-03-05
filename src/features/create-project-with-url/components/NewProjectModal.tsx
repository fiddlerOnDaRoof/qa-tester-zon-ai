"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useCreateProject } from "../lib/hooks";
import { CreateProjectSchema } from "../lib/validation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; target_url?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  const createProject = useCreateProject();

  // Focus name input when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setUrl("");
      setFieldErrors({});
      createProject.reset();
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const parsed = CreateProjectSchema.safeParse({ name, target_url: url });
      if (!parsed.success) {
        const errs: { name?: string; target_url?: string } = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as string;
          if (!errs[field as keyof typeof errs]) {
            errs[field as keyof typeof errs] = issue.message;
          }
        }
        setFieldErrors(errs);
        return;
      }

      setFieldErrors({});
      createProject.mutate(parsed.data, { onSuccess: () => onClose() });
    },
    [name, url, createProject, onClose]
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl border border-[#29422b]/40 p-6"
        style={{
          background: "linear-gradient(160deg, #141f14 0%, #182318 100%)",
          boxShadow:
            "0 0 0 1px rgba(41,66,43,0.15), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(41,66,43,0.15)",
        }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#d8f0d8]">New Project</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#5a805a] transition-colors hover:bg-[#29422b]/20 hover:text-[#7ab07a]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium text-[#7ab07a]">
              Project Name
            </label>
            <input
              ref={nameRef}
              id="project-name"
              type="text"
              placeholder="My App"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              className="w-full rounded-lg border border-[#29422b]/40 bg-[#0d1a0d] px-3 py-2 text-sm text-[#d8f0d8] placeholder-[#3a5a3a] outline-none transition-colors focus:border-[#29422b] focus:ring-1 focus:ring-[#29422b]/50"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          {/* URL field */}
          <div>
            <label htmlFor="project-url" className="mb-1.5 block text-xs font-medium text-[#7ab07a]">
              Target URL
            </label>
            <input
              id="project-url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (fieldErrors.target_url) setFieldErrors((p) => ({ ...p, target_url: undefined }));
              }}
              className="w-full rounded-lg border border-[#29422b]/40 bg-[#0d1a0d] px-3 py-2 text-sm text-[#d8f0d8] placeholder-[#3a5a3a] outline-none transition-colors focus:border-[#29422b] focus:ring-1 focus:ring-[#29422b]/50"
            />
            {fieldErrors.target_url && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.target_url}</p>
            )}
          </div>

          {/* API error */}
          {createProject.isError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {createProject.error?.message ?? "Something went wrong"}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#29422b]/40 px-4 py-2 text-xs font-medium text-[#7ab07a] transition-colors hover:bg-[#29422b]/20 hover:text-[#c8e8c8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="rounded-lg px-4 py-2 text-xs font-medium text-[#c8e8c8] transition-all hover:brightness-110 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #29422b, #3a5a3a)",
                boxShadow: "0 2px 8px rgba(41,66,43,0.4)",
              }}
            >
              {createProject.isPending ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </span>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
