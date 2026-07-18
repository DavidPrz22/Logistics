import { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DetalleOrden } from "@/types/types";
import { DetallesTable } from "../DetallesTable";
import { LiquidacionForm } from "./LiquidacionForm";

interface EnRutaPanelProps {
  ordenId: number;
  detalles: DetalleOrden[];
}

export function EnRutaPanel({ ordenId, detalles }: EnRutaPanelProps) {
  const [liquidando, setLiquidando] = useState(false);
  if (liquidando) return <LiquidacionForm ordenId={ordenId} detalles={detalles} onCancel={() => setLiquidando(false)} />;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-[color:var(--status-ruta-bg)]/40">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-[color:var(--status-ruta)]" />
          <div>
            <h2 className="font-semibold">Carga del camión (solo lectura)</h2>
            <p className="text-xs text-muted-foreground">La orden está en la calle. No se puede editar hasta liquidar el retorno.</p>
          </div>
        </div>
        <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => setLiquidando(true)}>
          <CheckCircle2 className="size-4 mr-1" /> Iniciar liquidación
        </Button>
      </div>
      <DetallesTable detalles={detalles} showSubtotal />
    </Card>
  );
}
