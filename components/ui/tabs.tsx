"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string }[];
  className?: string;
}

function Tabs({ value, onValueChange, tabs, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto rounded-2xl bg-tan-soft/60 p-1 no-scrollbar",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            "shrink-0 rounded-xl px-3.5 py-2 text-[13.5px] font-medium transition-colors whitespace-nowrap",
            value === tab.value
              ? "bg-surface-raised text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { Tabs };
