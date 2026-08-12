"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

function Switch({ checked, onCheckedChange, disabled, id, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150 disabled:opacity-40",
        checked ? "bg-forest" : "bg-border-strong"
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow transition-transform duration-150",
          checked ? "translate-x-[22px]" : "translate-x-[4px]"
        )}
        style={{ height: 22, width: 22 }}
      />
    </button>
  );
}

export { Switch };
