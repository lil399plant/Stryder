"use client";

import { cn } from "@/lib/utils";

export interface ChipOption {
  value: string;
  label: string;
}

interface SingleChoiceProps {
  options: ChipOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

function ChoiceChips({ options, value, onChange, className }: SingleChoiceProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-10 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors active:scale-[0.98]",
            value === opt.value
              ? "border-forest bg-forest-soft text-forest-soft-foreground"
              : "border-border-strong bg-surface-raised text-foreground hover:bg-tan-soft/30"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface MultiChoiceProps {
  options: ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

function MultiChoiceChips({ options, values, onChange, className }: MultiChoiceProps) {
  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => toggle(opt.value)}
          className={cn(
            "min-h-10 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors active:scale-[0.98]",
            values.includes(opt.value)
              ? "border-blue bg-blue-soft text-blue-soft-foreground"
              : "border-border-strong bg-surface-raised text-foreground hover:bg-tan-soft/30"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export { ChoiceChips, MultiChoiceChips };
