import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Lock } from "lucide-react";
import { CardexSearch } from "@/features/Kardex/components/KardexSearch";

export const Route = createFileRoute("/inventario/kardex")({ component: Kardex });

function Kardex() {
  // MAIN FILE OF THE ROUTE
  return (
    <div className="p-8 max-w-350 mx-auto space-y-6">
      <PageHeader
        eyebrow="Módulo de inventario · Auditoría"
        title="Kardex de movimientos"
        subtitle="Busca productos por SKU o nombre para ver el historial completo de movimientos. Solo lectura — trazabilidad completa."
        actions={<span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3.5" /> Sin edición</span>}
      />

      <div className="max-w-2xl mx-auto">
        <CardexSearch size="lg" autoFocus />
      </div>
    </div>
  );
}