import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" && "bg-olive text-white hover:bg-olive-2",
      variant === "secondary" && "bg-coyote/15 text-forest hover:bg-coyote/25",
      variant === "ghost" && "text-olive hover:bg-olive/10",
      variant === "danger" && "bg-red-800 text-white hover:bg-red-900",
      className,
    )}
    {...props}
  />
));

Button.displayName = "Button";
