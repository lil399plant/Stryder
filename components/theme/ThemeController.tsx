"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Applies the Light/Dark/System theme setting to <html class="dark">. */
export function ThemeController() {
  const { data } = useStore();
  const theme = data?.settings.theme ?? "system";

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);

    if (theme === "dark") {
      apply(true);
      return;
    }
    if (theme === "light") {
      apply(false);
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches);
    const listener = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  return null;
}
