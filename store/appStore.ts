"use client";

import { create } from "zustand";

interface AppState {
  selectedProjectId: string | null;
  activeConversationId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedProjectId: null,
  activeConversationId: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  reset: () => set(initialState),
}));
