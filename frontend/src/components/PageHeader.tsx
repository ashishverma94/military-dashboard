import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[.25em] text-olive/60">
          Operations
        </p>
        <h1 className="text-3xl font-black tracking-tight text-forest">
          {title}
        </h1>
        <p className="mt-1 text-sm text-forest/50">{description}</p>
      </div>
      {action}
    </div>
  );
}
