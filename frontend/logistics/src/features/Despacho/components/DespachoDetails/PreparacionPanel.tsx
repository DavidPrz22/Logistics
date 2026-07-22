import { useState } from "react";
import { toast } from "sonner";
import { Truck, Edit, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DetalleOrdenDetail, DetallesOrdenDespacho } from "../../schemas/schema";
import { DetallesTable } from "../DetallesTable";
import { EditorLineasDialog } from "./EditorLineasDialog";
import { useUpdateOrdenDetallesMutation } from "../../hooks/mutations/mutations";
interface PreparacionPanelProps {
  ordenId: number;
  detalles: DetalleOrdenDetail[];
  onDispatch: () => Promise<void>;
}

export function PreparacionPanel({ ordenId, detalles, onDispatch }: PreparacionPanelProps) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const canDispatch = detalles.length > 0;

  const { mutateAsync: updateOrdenDetalles } = useUpdateOrdenDetallesMutation(ordenId);

  const handleSaveLineas = async (detalles: DetallesOrdenDespacho[]) => {
    try {
      await updateOrdenDetalles(detalles);
      toast.success("Componentes actualizados");
    } catch {
      toast.error("Error al actualizar los componentes");
    }
  };

  const handleDispatch = async () => {
    await onDispatch();
    setConfirm(false)
  }
  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold">Componentes de carga</h2>
            <p className="text-xs text-muted-foreground">Editables mientras la orden esté en preparación.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={() => setEditing(true)}><Edit className="size-4 mr-1 cursor-pointer" /> Editar componentes</Button>
            <Button size="lg" disabled={!canDispatch} onClick={() => setConfirm(true)} className="bg-accent text-accent-foreground hover:bg-amber-500 cursor-pointer">
              <Truck className="size-4 mr-1" /> Despachar
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

      {editing && <EditorLineasDialog initial={detalles} onClose={() => setEditing(false)} onSave={handleSaveLineas} />}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Despachar orden</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Al despachar, se generan movimientos de SALIDA desde el almacén principal hacia el almacén en tránsito. La carga queda de solo lectura hasta liquidar.</p>
          <DialogFooter>
            <Button 
            variant="ghost" 
            size="lg" 
            className="cursor-pointer border-border" 
            onClick={async () => {
              setConfirm(false)
              }}
            >Cancelar</Button>
            <Button 
            size="lg" 
            className="bg-accent text-accent-foreground hover:bg-amber-500 cursor-pointer" 
            onClick={handleDispatch}
            >
              Confirmar despacho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
