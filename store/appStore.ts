"use client";

import { create } from "zustand";

interface AppState {
  selectedProjectId: string | null;
  activeConversationId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedProjectId: null,
  activeConversationId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
