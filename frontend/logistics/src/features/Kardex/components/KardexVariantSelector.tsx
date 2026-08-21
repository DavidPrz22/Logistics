import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { VarianteKardex } from '../schemas/schemas';

export function VariantSelector({
  variantes,
  activo,
}: {
  variantes: VarianteKardex[];
  activo: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variantes.map((v) => {
        const active = v.sku === activo;
        return (
          <Link
            key={v.id}
            to="/kardex/$skuid"
            params={{ skuid: v.sku }}
            replace
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {v.nombre}
            <span
              className={cn(
                "ml-2 font-mono text-[10px]",
                active ? "opacity-80" : "opacity-60"
              )}
            >
              {v.sku}
            </span>
          </Link>
        );
      })}
    </div>
  );
}