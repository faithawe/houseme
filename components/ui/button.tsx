import { cva, type VariantProps } from "class-variance-authority";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[color,background-color,border-color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-stamp text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-stamp-700",
        stamp:
          "bg-stamp text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-stamp-700 motion-safe:hover:scale-[1.02] active:scale-[0.98]",
        navy: "bg-ink text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-navy-800",
        outline:
          "border border-line bg-white text-ink hover:border-ink hover:bg-ink hover:text-white",
        secondary:
          "border border-line bg-white text-ink hover:border-stamp hover:bg-palm-100",
        ghost: "text-ink hover:bg-black/5",
        slip: "border border-dashed border-line bg-white text-ink hover:border-stamp",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
