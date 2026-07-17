import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { erpActions, useERP, findLote, findVariante } from "@/lib/erp-store";
import { useAlmacenes, useChoferes, useClientes } from "@/hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";

export const Route = createFileRoute("/despachos/crear")({ component: CrearOrden });

interface LineaBorrador { key: string; lote_id: number; cantidad: number; precio: number; }

function CrearOrden() {
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

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Cabecera</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cliente">
            <Combobox items={clientes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.direccion }))} value={cliente} onChange={setCliente} placeholder="Elegir cliente…" />
          </Field>
          <Field label="Chofer">
            <Combobox items={choferes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.licenciaConducir }))} value={chofer} onChange={setChofer} placeholder="Elegir chofer…" />
          </Field>
          <Field label="Almacén de tránsito">
            <Combobox items={almacenes.filter((a) => a.tipo === "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} value={almacen} onChange={setAlmacen} placeholder="Elegir almacén…" />
          </Field>
          <Field label="Fecha de salida">
            <DatePicker value={fecha} onChange={(v) => setFecha(v)} placeholder="Fecha de salida" />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Detalle de carga</h2>
          <p className="text-xs text-muted-foreground mt-1">Opcional en creación. Podrás añadir lotes desde el panel de detalle antes de despachar.</p>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Field label="Buscar variante / lote">
              <Combobox
                items={lotesDisponibles.map((l) => {
                  const v = findVariante(state, l.variante_id)!;
                  return { value: String(l.id), label: `${v.sku} · ${v.nombre}`, hint: `Lote ${l.numero_lote} · Stock ${l.stock_actual}` };
                })}
                value={addLote}
                onChange={setAddLote}
                placeholder="Buscar SKU o lote…"
              />
            </Field>
          </div>
          <Button onClick={addLinea} disabled={!addLote}><Plus className="size-4 mr-1" /> Añadir</Button>
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/60">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="w-28">Cantidad</TableHead>
                <TableHead className="w-32">Precio unit.</TableHead>
                <TableHead className="text-right w-32">Subtotal</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineas.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin líneas. Puedes crear la orden vacía y añadir después.</TableCell></TableRow>
              )}
              {lineas.map((ln, idx) => {
                const l = findLote(state, ln.lote_id)!;
                const v = findVariante(state, l.variante_id)!;
                const setLn = (patch: Partial<LineaBorrador>) => setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));
                return (
                  <TableRow key={ln.key}>
                    <TableCell className="font-mono font-semibold">{v.sku}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{l.numero_lote}<div className="text-[11px]">Stock: {l.stock_actual}</div></TableCell>
                    <TableCell><Input type="number" min={1} max={l.stock_actual} value={ln.cantidad} onChange={(e) => setLn({ cantidad: Math.max(1, Number(e.target.value)) })} className="h-8" /></TableCell>
                    <TableCell><Input type="number" step="0.01" min={0} value={ln.precio} onChange={(e) => setLn({ precio: Number(e.target.value) })} className="h-8 font-mono" /></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">${(ln.cantidad * ln.precio).toFixed(2)}</TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => setLineas((prev) => prev.filter((_, i) => i !== idx))}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}