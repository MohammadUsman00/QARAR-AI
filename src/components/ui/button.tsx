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
          "bg-accent-primary text-bg-primary hover:bg-accent-secondary shadow-glowGold hover:scale-[1.01]",
        ghost:
          "border border-border-subtle bg-transparent text-text-primary hover:border-border-active hover:shadow-glowGold hover:scale-[1.01]",
        outline:
          "border border-border-active bg-bg-secondary text-text-primary hover:bg-bg-tertiary",
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
