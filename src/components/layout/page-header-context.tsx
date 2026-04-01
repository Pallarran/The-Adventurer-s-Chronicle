"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface PageHeaderState {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

interface PageHeaderContextType {
  header: PageHeaderState | null;
  setHeader: (state: PageHeaderState | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType>({
  header: null,
  setHeader: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderState | null>(null);

  const setHeader = useCallback((state: PageHeaderState | null) => {
    setHeaderState(state);
  }, []);

  return (
    <PageHeaderContext value={{ header, setHeader }}>
      {children}
    </PageHeaderContext>
  );
}

export function usePageHeader() {
  return useContext(PageHeaderContext);
}
