import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-20 w-full rounded-xl border border-border-strong bg-surface-raised px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-forest/40 disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
