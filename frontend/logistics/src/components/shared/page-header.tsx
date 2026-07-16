import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-3xl font-bold tracking-tight mt-1">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}