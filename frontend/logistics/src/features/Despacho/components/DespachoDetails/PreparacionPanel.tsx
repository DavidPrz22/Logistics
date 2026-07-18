import { useState } from "react";
import { toast } from "sonner";
import { Truck, Edit, AlertTriangle } from "lucide-react";
import { erpActions } from "@/lib/erp-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DetalleOrden } from "@/types/types";
import { DetallesTable } from "../DetallesTable";
import { EditorLineasDialog } from "./EditorLineasDialog";

interface PreparacionPanelProps {
  ordenId: number;
  detalles: DetalleOrden[];
}

export function PreparacionPanel({ ordenId, detalles }: PreparacionPanelProps) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const canDispatch = detalles.length > 0;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold">Componentes de carga</h2>
            <p className="text-xs text-muted-foreground">Editables mientras la orden esté en preparación.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="size-4 mr-1" /> Editar componentes</Button>
            <Button size="sm" disabled={!canDispatch} onClick={() => setConfirm(true)} className="bg-accent text-accent-foreground hover:brightness-95">
              <Truck className="size-4 mr-1" /> Despachar (EN_RUTA)
            </Button>
          </div>
        </div>
        <DetallesTable detalles={detalles} showSubtotal />
        {!canDispatch && (
          <div className="p-4 border-t border-border bg-secondary/40 text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="size-4 text-accent" /> Añade al menos un lote antes de despachar. El botón está bloqueado por regla de validación del frontend.
          </div>
        )}
      </Card>

      {editing && <EditorLineasDialog ordenId={ordenId} initial={detalles} onClose={() => setEditing(false)} />}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Despachar orden</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Al despachar, se generan movimientos de SALIDA desde el almacén principal hacia el almacén en tránsito. La carga queda de solo lectura hasta liquidar.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground" onClick={() => { erpActions.despachar(ordenId); toast.success("Orden en ruta"); setConfirm(false); }}>Confirmar despacho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
