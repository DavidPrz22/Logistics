import { Link } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';
import { KardexBreadcrumb } from './KardexBreadcrumb';

export function KardexErrorState({ message, skuId }: { message: string; skuId: string }) {
  return (
    <div className="mx-auto max-w-350 space-y-6 p-8">
      <KardexBreadcrumb label={skuId} />
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
        <AlertCircle className="mb-4 size-12 text-destructive" />
        <h2 className="text-lg font-semibold text-destructive">Error al cargar el Kardex</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/kardex"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Buscar otro SKU
          </Link>
        </div>
      </div>
    </div>
  );
}
