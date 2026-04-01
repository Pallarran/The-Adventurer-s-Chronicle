"use client";

import { useEffect } from "react";
import { usePageHeader } from "./page-header-context";

interface PageHeaderSetterProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeaderSetter({
  title,
  description,
  backHref,
  backLabel,
}: PageHeaderSetterProps) {
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader({ title, description, backHref, backLabel });
    return () => setHeader(null);
  }, [title, description, backHref, backLabel, setHeader]);

  return null;
}
