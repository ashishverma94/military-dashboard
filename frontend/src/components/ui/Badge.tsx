import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, ...p }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-olive/10 px-2.5 py-1 text-xs font-semibold text-olive",
        className,
      )}
      {...p}
    />
  );
}
