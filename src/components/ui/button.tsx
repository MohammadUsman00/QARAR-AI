import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px] px-4 py-2",
  {
    variants: {
      variant: {
        default:
          "royal-btn-shine bg-gradient-to-b from-accent-secondary to-accent-primary font-royal text-sm uppercase tracking-wider text-bg-primary shadow-glowGold hover:scale-[1.02] hover:shadow-glowRoyal",
        royal:
          "royal-btn-shine border border-accent-royal/40 bg-royal-deep/80 font-royal text-sm uppercase tracking-wider text-accent-secondary shadow-glowRoyal hover:border-accent-royal hover:bg-royal-purple/40",
        ghost:
          "border border-border-subtle bg-transparent font-sans normal-case tracking-normal text-text-primary hover:border-border-active hover:shadow-glowGold hover:scale-[1.01]",
        outline:
          "border border-border-active bg-bg-secondary/80 font-sans normal-case tracking-normal text-text-primary backdrop-blur-sm hover:bg-bg-tertiary",
        danger: "bg-accent-danger/90 text-white hover:bg-accent-danger",
        link: "text-accent-primary underline-offset-4 hover:underline min-h-0 px-0",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
