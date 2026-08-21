import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Clock, History, Trash2 } from "lucide-react";
import { CardexSearch } from "@/features/Kardex/components/KardexSearch";
import { useKardexSearchStore } from "@/features/Kardex/store/zustandstore";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute('/kardex/')({
  head: () => ({
    meta: [
      { title: "Cárdex e historial de movimientos — Inventario | Tráfico ERP" },
      { name: "description", content: "Busca un producto o SKU para auditar su cárdex: entradas, salidas, documento, costo unitario y saldo resultante por movimiento." },
      { property: "og:title", content: "Cárdex e historial de movimientos" },
      { property: "og:description", content: "Consulta el historial de inventario por SKU con saldo acumulado y trazabilidad de documentos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardexIndexView,
});

function CardexIndexView() {
  const { recientes, clearRecientes } = useKardexSearchStore();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-8">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ClipboardList className="size-3.5" /> Módulo de inventario · Auditoría
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kárdex e historial de movimientos</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Busca un producto o SKU para ver su historial completo de entradas, salidas y saldo resultante.
          </p>
        </div>

        <CardexSearch size="lg" autoFocus />

        <div className="border-t border-border pt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="size-3.5" /> Búsquedas recientes
            </span>
            {recientes.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearRecientes}>
                <Trash2 className="mr-1 size-3.5" /> Limpiar
              </Button>
            )}
          </div>
          {recientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay consultas. Las últimas búsquedas aparecerán aquí.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recientes.map((r) => (
                <Link
                  key={r.sku}
                  to="/kardex/"
                  params={{ skuId: r.sku }}
                  className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                >
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="truncate">{r.nombre}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{r.sku}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}