import { History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKardexSearchStore } from '../store/zustandstore';
import { KardexRecentSearchChip } from './KardexRecentSearchChip';

export function KardexRecentSearches() {
  const { recientes, clearRecientes } = useKardexSearchStore();

  return (
    <div className="border-t border-border pt-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <History className="size-3.5" /> Búsquedas recientes
        </span>
        {recientes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={clearRecientes}
          >
            <Trash2 className="mr-1 size-3.5" /> Limpiar
          </Button>
        )}
      </div>
      {recientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay consultas. Las últimas búsquedas aparecerán aquí.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {recientes.map((r) => (
            <KardexRecentSearchChip key={r.sku} item={r} />
          ))}
        </div>
      )}
    </div>
  );
}
