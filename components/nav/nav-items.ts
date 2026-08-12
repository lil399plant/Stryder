import { Home, NotebookPen, Target, HeartPulse, Menu } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/log", label: "Log", icon: NotebookPen },
  { href: "/training", label: "Training", icon: Target },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/more", label: "More", icon: Menu },
] as const;
