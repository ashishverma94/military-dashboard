import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-olive/10 bg-white shadow-sm",
        className,
      )}
      {...p}
    />
  );
}
export function CardHeader({
  className,
  ...p
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3", className)} {...p} />;
}
export function CardContent({
  className,
  ...p
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-3", className)} {...p} />;
}
