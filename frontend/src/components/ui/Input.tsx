import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-olive/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-olive focus:ring-2 focus:ring-olive/15",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
