import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none",
  {
    variants: {
      variant: {
        forest: "bg-forest-soft text-forest-soft-foreground",
        blue: "bg-blue-soft text-blue-soft-foreground",
        tan: "bg-tan-soft text-tan-soft-foreground",
        concern: "bg-concern-soft text-concern-soft-foreground",
        neutral: "bg-surface-raised text-muted-foreground border border-border",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
