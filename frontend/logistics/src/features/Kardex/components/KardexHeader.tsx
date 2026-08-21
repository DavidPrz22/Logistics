import type { ReactNode } from 'react';

export function KardexHeader({
  title,
  subtitle,
  isLoading,
  children,
}: {
  title: string;
  subtitle: string;
  isLoading: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isLoading ? (
            <span className="inline-block h-8 w-48 animate-pulse rounded bg-muted" />
          ) : (
            title
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          Variante activa:{' '}
          <span className="font-mono font-semibold text-foreground">
            {isLoading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
            ) : (
              subtitle
            )}
          </span>
        </p>
      </div>
      <div className="flex w-full max-w-xl items-center gap-2">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
