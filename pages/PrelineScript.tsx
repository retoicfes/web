"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    HSStaticMethods?: {
      autoInit: (collection?: string | string[]) => void;
    };
  }
}

export default function PrelineScript() {
  const path = usePathname();

  useEffect(() => {
    const loadPreline = async () => {
      await import("preline");

      window.HSStaticMethods?.autoInit();
    };

    loadPreline();
  }, [path]);

  return null;
}
