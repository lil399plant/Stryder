import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-forest text-forest-foreground hover:bg-forest/90",
        secondary: "bg-tan-soft text-tan-soft-foreground hover:bg-tan-soft/80",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-raised",
        ghost: "bg-transparent text-foreground hover:bg-surface-raised",
        subtle: "bg-surface-raised text-foreground hover:bg-surface-raised/70 border border-border",
        concern: "bg-concern text-concern-foreground hover:bg-concern/90",
        link: "text-forest underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-14 px-6 text-base",
        icon: "h-10 w-10",
        tap: "h-24 px-3 flex-col text-[15px] font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
