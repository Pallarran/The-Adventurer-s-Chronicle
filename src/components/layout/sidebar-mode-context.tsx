"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SidebarMode = "full" | "icon" | "hidden";

const STORAGE_KEY = "sidebar-mode";
const VALID_MODES: SidebarMode[] = ["full", "icon", "hidden"];

interface SidebarModeContextType {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
}

const SidebarModeContext = createContext<SidebarModeContextType>({
  mode: "full",
  setMode: () => {},
});

export function SidebarModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SidebarMode>("full");

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_MODES.includes(saved as SidebarMode)) {
        setModeState(saved as SidebarMode);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  // Persist to localStorage on change
  const setMode = useCallback((next: SidebarMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — in-memory only
    }
  }, []);

  return (
    <SidebarModeContext value={{ mode, setMode }}>
      {children}
    </SidebarModeContext>
  );
}

export function useSidebarMode() {
  return useContext(SidebarModeContext);
}
