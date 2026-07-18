import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Info } from "lucide-react";
import { erpActions, useERP, findLote, findVariante } from "@/lib/erp-store";
import { useAlmacenes, useChoferes, useClientes } from "@/hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LineaBorrador } from "../../types/types";
import { HeaderForm } from "./HeaderForm";
import { LineaBorradorAddRow } from "./LineaBorradorAddRow";
import { LineaBorradorTable } from "./LineaBorradorTable";

export function DespachoCreatePage() {
  const state = useERP((s) => s);
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const { data: choferes = [] } = useChoferes();
  const { data: almacenes = [] } = useAlmacenes();
  const [cliente, setCliente] = useState("");
  const [chofer, setChofer] = useState("");
  const [almacen, setAlmacen] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [lineas, setLineas] = useState<LineaBorrador[]>([]);
  const [addLote, setAddLote] = useState("");

  const lotesDisponibles = useMemo(() => state.lotes.filter((l) => l.almacen_id === 1 && l.stock_actual > 0), [state.lotes]);

  const addLinea = () => {
    const l = findLote(state, Number(addLote));
    if (!l) return;
    const v = findVariante(state, l.variante_id);
    setLineas((prev) => [...prev, { key: `${Date.now()}-${l.id}`, lote_id: l.id, cantidad: 1, precio: v?.precio_base ?? 0 }]);
    setAddLote("");
  };

  const updateLinea = (idx: number, patch: Partial<LineaBorrador>) => setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));
  const removeLinea = (idx: number) => setLineas((prev) => prev.filter((_, i) => i !== idx));

  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const canCreate = cliente && chofer && almacen && fecha;

  const submit = () => {
    if (!canCreate) return;
    const id = erpActions.createOrden({
      cliente_id: Number(cliente),
      chofer_id: Number(chofer),
      almacen_transito_id: Number(almacen),
      fecha_salida: `${fecha}T08:00:00Z`,
      detalles: lineas.map((l) => ({ lote_id: l.lote_id, cantidad_enviada: l.cantidad, precio_unitario: l.precio })),
    });
    toast.success("Orden creada en estado PREPARACIÓN");
    navigate({ to: "/despachos/$ordenId", params: { ordenId: String(id) } });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Nueva orden de despacho"
        title="Crear orden"
        subtitle="Se registra en PREPARACIÓN. Podrás editar componentes antes de despachar a EN_RUTA."
        actions={<Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver</Link>}
      />

      <HeaderForm
        cliente={cliente} chofer={chofer} almacen={almacen} fecha={fecha}
        clientes={clientes} choferes={choferes} almacenes={almacenes}
        onClienteChange={setCliente} onChoferChange={setChofer} onAlmacenChange={setAlmacen} onFechaChange={setFecha}
      />

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Detalle de carga</h2>
          <p className="text-xs text-muted-foreground mt-1">Opcional en creación. Podrás añadir lotes desde el panel de detalle antes de despachar.</p>
        </div>

        <LineaBorradorAddRow lotesDisponibles={lotesDisponibles} addLote={addLote} onAddLoteChange={setAddLote} onAdd={addLinea} />

        <LineaBorradorTable lineas={lineas} onUpdateLinea={updateLinea} onRemoveLinea={removeLinea} />

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md"><Info className="size-4 shrink-0 mt-0.5" /> El botón "Despachar" en el detalle se activa solo cuando hay al menos una línea.</div>
          <div className="text-right">
            <div className="text-xs uppercase text-muted-foreground">Total facturado</div>
            <div className="text-2xl font-bold font-mono tabular-nums">${total.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to="/despachos" className="inline-flex items-center px-4 py-2 text-sm rounded-md border border-border hover:bg-muted">Cancelar</Link>
        <Button onClick={submit} disabled={!canCreate} className="bg-primary text-primary-foreground">Crear orden</Button>
      </div>
    </div>
  );
}
