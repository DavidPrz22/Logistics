import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { erpActions, findAlmacen, findChofer, findCliente, findLote, findMotivo, findVariante, useERP } from "@/lib/erp-store";
import type { DetalleOrden } from "@/types/types";
import { PageHeader } from "@/components/shared/page-header";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Combobox } from "@/components/shared/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Truck, Edit, CheckCircle2, Plus, Trash2, AlertTriangle, Lock } from "lucide-react";

export const Route = createFileRoute("/despachos/$ordenId")({
  component: DetalleOrden,
  notFoundComponent: () => <div className="p-12 text-center text-muted-foreground">Orden no encontrada.</div>,
});

function DetalleOrden() {
  const { ordenId } = Route.useParams();
  const id = Number(ordenId);
  const state = useERP((s) => s);
  const orden = state.ordenes.find((o) => o.id === id);
  if (!orden) throw notFound();

  const detalles = state.detalles.filter((d) => d.orden_id === id);
  const rechazos = state.rechazos.filter((r) => detalles.some((d) => d.id === r.detalle_orden_id));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow={<span className="font-mono">{orden.numero_orden}</span> as unknown as string}
        title={findCliente(state, orden.cliente_id)?.nombre ?? "Cliente"}
        subtitle={`Chofer: ${findChofer(state, orden.chofer_id)?.nombre ?? "—"} · Tránsito: ${findAlmacen(state, orden.almacen_transito_id)?.nombre} · Salida: ${new Date(orden.fecha_salida).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            <EstadoBadge estado={orden.estado} />
            <Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Lista</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Líneas" value={detalles.length} />
        <StatCard label="Unidades" value={detalles.reduce((s, d) => s + d.cantidad_enviada, 0)} />
        <StatCard label="Facturado" value={`$${orden.total_facturado_original.toFixed(2)}`} mono />
        <StatCard label="Neto a cobrar" value={`$${orden.saldo_neto_cobrar.toFixed(2)}`} mono highlight />
      </div>

      {orden.estado === "PREPARACION" && <PreparacionPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "EN_RUTA" && <EnRutaPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "LIQUIDADA" && <LiquidadaPanel detalles={detalles} rechazos={rechazos} />}
    </div>
  );
}

function StatCard({ label, value, mono, highlight }: { label: string; value: string | number; mono?: boolean; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${mono ? "font-mono" : ""} ${highlight ? "text-accent-foreground" : ""}`}>{value}</div>
    </Card>
  );
}

// ------- PREPARACION -------
function PreparacionPanel({ ordenId, detalles }: { ordenId: number; detalles: DetalleOrden[] }) {
  const state = useERP((s) => s);
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

function DetallesTable({ detalles, showSubtotal }: { detalles: DetalleOrden[]; showSubtotal?: boolean }) {
  const state = useERP((s) => s);
  return (
    <Table>
      <TableHeader className="bg-secondary/60">
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          {showSubtotal && <TableHead className="text-right">Subtotal</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {detalles.length === 0 && <TableRow><TableCell colSpan={showSubtotal ? 6 : 5} className="text-center text-muted-foreground py-8">Sin componentes.</TableCell></TableRow>}
        {detalles.map((d) => {
          const l = findLote(state, d.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
          return (
            <TableRow key={d.id}>
              <TableCell className="font-mono font-semibold">{v?.sku}</TableCell>
              <TableCell>{v?.nombre}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{l?.numero_lote}</TableCell>
              <TableCell className="text-right tabular-nums">{d.cantidad_enviada}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">${d.precio_unitario.toFixed(2)}</TableCell>
              {showSubtotal && <TableCell className="text-right font-mono tabular-nums">${(d.cantidad_enviada * d.precio_unitario).toFixed(2)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function EditorLineasDialog({ ordenId, initial, onClose }: { ordenId: number; initial: DetalleOrden[]; onClose: () => void }) {
  const state = useERP((s) => s);
  const [lineas, setLineas] = useState(() => initial.map((d) => ({ ...d, key: `d${d.id}` })));
  const [addLote, setAddLote] = useState("");
  const lotesDisponibles = state.lotes.filter((l) => l.almacen_id === 1 && l.stock_actual > 0);

  const add = () => {
    const l = findLote(state, Number(addLote)); if (!l) return;
    const v = findVariante(state, l.variante_id);
    setLineas((prev) => [...prev, { id: 0, orden_id: ordenId, lote_id: l.id, cantidad_enviada: 1, precio_unitario: v?.precio_base ?? 0, key: `n${Date.now()}` } as any]);
    setAddLote("");
  };

  const save = () => {
    erpActions.updateDetalles(ordenId, lineas.map((l) => ({ id: l.id || undefined, lote_id: l.lote_id, cantidad_enviada: l.cantidad_enviada, precio_unitario: l.precio_unitario })));
    toast.success("Componentes actualizados");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Editar componentes</DialogTitle></DialogHeader>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs uppercase text-muted-foreground">Añadir lote</label>
            <Combobox
              items={lotesDisponibles.map((l) => { const v = findVariante(state, l.variante_id)!; return { value: String(l.id), label: `${v.sku} · ${v.nombre}`, hint: `${l.numero_lote} · Stock ${l.stock_actual}` }; })}
              value={addLote} onChange={setAddLote} placeholder="Buscar lote…"
            />
          </div>
          <Button onClick={add} disabled={!addLote}><Plus className="size-4 mr-1" /> Añadir</Button>
        </div>

        <div className="max-h-96 overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="bg-secondary/60"><TableRow>
              <TableHead>SKU / Lote</TableHead><TableHead className="w-28">Cantidad</TableHead><TableHead className="w-32">Precio</TableHead><TableHead className="w-12" />
            </TableRow></TableHeader>
            <TableBody>
              {lineas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sin líneas.</TableCell></TableRow>}
              {lineas.map((ln, idx) => {
                const l = findLote(state, ln.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
                const upd = (patch: Partial<typeof ln>) => setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));
                return (
                  <TableRow key={(ln as any).key}>
                    <TableCell><div className="font-mono font-semibold">{v?.sku}</div><div className="text-xs text-muted-foreground">{l?.numero_lote}</div></TableCell>
                    <TableCell><Input type="number" min={1} value={ln.cantidad_enviada} onChange={(e) => upd({ cantidad_enviada: Math.max(1, Number(e.target.value)) })} className="h-8" /></TableCell>
                    <TableCell><Input type="number" step="0.01" value={ln.precio_unitario} onChange={(e) => upd({ precio_unitario: Number(e.target.value) })} className="h-8 font-mono" /></TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => setLineas((prev) => prev.filter((_, i) => i !== idx))}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------- EN_RUTA -------
function EnRutaPanel({ ordenId, detalles }: { ordenId: number; detalles: DetalleOrden[] }) {
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

// ------- LIQUIDACION FORM -------
interface RechazoDraft { key: string; cantidad: number; motivo_id: string; almacen_id: string; obs: string; }
interface DetalleLiq { detalle_id: number; devuelta: number; rechazos: RechazoDraft[]; }

function LiquidacionForm({ ordenId, detalles, onCancel }: { ordenId: number; detalles: DetalleOrden[]; onCancel: () => void }) {
  const state = useERP((s) => s);
  const [rows, setRows] = useState<DetalleLiq[]>(() => detalles.map((d) => ({ detalle_id: d.id, devuelta: 0, rechazos: [] })));

  const update = (idx: number, patch: Partial<DetalleLiq>) => setRows((prev) => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));

  const addRechazo = (idx: number) => update(idx, { rechazos: [...rows[idx].rechazos, { key: `r${Date.now()}`, cantidad: 0, motivo_id: "", almacen_id: "5", obs: "" }] });
  const updRechazo = (idx: number, ri: number, patch: Partial<RechazoDraft>) => {
    const nr = rows[idx].rechazos.map((x, i) => i === ri ? { ...x, ...patch } : x);
    update(idx, { rechazos: nr });
  };
  const rmRechazo = (idx: number, ri: number) => update(idx, { rechazos: rows[idx].rechazos.filter((_, i) => i !== ri) });

  const validation = useMemo(() => rows.map((r) => {
    const d = detalles.find((x) => x.id === r.detalle_id)!;
    const sumRech = r.rechazos.reduce((s, x) => s + x.cantidad, 0);
    const problems: string[] = [];
    if (r.devuelta > d.cantidad_enviada) problems.push("Devuelta supera lo enviado");
    if (r.devuelta > 0 && sumRech !== r.devuelta) problems.push(`Motivos suman ${sumRech}, deben sumar ${r.devuelta}`);
    if (r.rechazos.some((x) => !x.motivo_id)) problems.push("Motivo requerido");
    return { detalle_id: r.detalle_id, problems, sumRech };
  }), [rows, detalles]);

  const hasErrors = validation.some((v) => v.problems.length > 0);

  const submit = () => {
    if (hasErrors) { toast.error("Corrige los errores de liquidación"); return; }
    erpActions.liquidar(ordenId, rows.filter((r) => r.devuelta > 0).map((r) => ({
      detalle_orden_id: r.detalle_id,
      rechazos: r.rechazos.map((x) => ({ cantidad: x.cantidad, motivo_rechazo_id: Number(x.motivo_id), almacen_reingreso_id: Number(x.almacen_id), observaciones: x.obs || undefined })),
    })));
    toast.success("Orden liquidada");
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-[color:var(--status-liq-bg)]/40">
        <h2 className="font-semibold">Liquidación de retornos</h2>
        <p className="text-xs text-muted-foreground">Registra las unidades devueltas y divide por motivo. La suma de motivos debe igualar la cantidad devuelta.</p>
      </div>
      <div className="divide-y divide-border">
        {detalles.map((d, idx) => {
          const r = rows[idx]; const v = validation[idx];
          const l = findLote(state, d.lote_id); const va = l ? findVariante(state, l.variante_id) : undefined;
          return (
            <div key={d.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <div className="font-mono font-semibold">{va?.sku}</div>
                  <div className="text-sm text-muted-foreground">{va?.nombre} · {l?.numero_lote}</div>
                </div>
                <div className="md:col-span-2 text-sm">
                  <div className="text-xs text-muted-foreground">Enviada</div>
                  <div className="font-mono tabular-nums text-lg">{d.cantidad_enviada}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Devuelta</label>
                  <Input type="number" min={0} max={d.cantidad_enviada} value={r.devuelta} onChange={(e) => update(idx, { devuelta: Math.max(0, Number(e.target.value)) })} className="h-9 font-mono" />
                </div>
                <div className="md:col-span-2 text-sm">
                  <div className="text-xs text-muted-foreground">Cobrada</div>
                  <div className="font-mono tabular-nums text-lg text-[color:var(--status-liq)]">{d.cantidad_enviada - r.devuelta}</div>
                </div>
                <div className="md:col-span-2 text-right text-sm">
                  <div className="text-xs text-muted-foreground">Rechazado</div>
                  <div className="font-mono tabular-nums">${(r.devuelta * d.precio_unitario).toFixed(2)}</div>
                </div>
              </div>

              {r.devuelta > 0 && (
                <div className="mt-4 ml-4 pl-4 border-l-2 border-accent/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Motivos del rechazo · suman <span className={v.sumRech === r.devuelta ? "text-[color:var(--status-liq)]" : "text-destructive"}>{v.sumRech}</span> de {r.devuelta}</div>
                    <Button size="sm" variant="outline" onClick={() => addRechazo(idx)}><Plus className="size-3.5 mr-1" /> Añadir motivo</Button>
                  </div>
                  {r.rechazos.map((rc, ri) => (
                    <div key={rc.key} className="grid grid-cols-12 gap-2 items-end bg-secondary/40 rounded-md p-3">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Unidades</label>
                        <Input type="number" min={1} value={rc.cantidad} onChange={(e) => updRechazo(idx, ri, { cantidad: Math.max(0, Number(e.target.value)) })} className="h-8 font-mono" />
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs text-muted-foreground">Motivo</label>
                        <Combobox items={state.motivosRechazo.map((m) => ({ value: String(m.id), label: `${m.codigo} · ${m.descripcion}`, hint: m.requiere_merma ? "→ Merma" : "→ Principal" }))} value={rc.motivo_id} onChange={(v) => { const m = state.motivosRechazo.find((x) => String(x.id) === v); updRechazo(idx, ri, { motivo_id: v, almacen_id: m?.requiere_merma ? "5" : "1" }); }} placeholder="Motivo…" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-muted-foreground">Almacén reingreso</label>
                        <Combobox items={state.almacenes.filter((a) => a.tipo !== "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} value={rc.almacen_id} onChange={(v) => updRechazo(idx, ri, { almacen_id: v })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Observaciones</label>
                        <Input value={rc.obs} onChange={(e) => updRechazo(idx, ri, { obs: e.target.value })} className="h-8" />
                      </div>
                      <div className="col-span-1"><Button size="icon" variant="ghost" onClick={() => rmRechazo(idx, ri)}><Trash2 className="size-4 text-destructive" /></Button></div>
                    </div>
                  ))}
                  {v.problems.length > 0 && (
                    <div className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="size-3.5" /> {v.problems.join(" · ")}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={submit} disabled={hasErrors} className="bg-[color:var(--status-liq)] text-white hover:brightness-95">
          <CheckCircle2 className="size-4 mr-1" /> Confirmar liquidación
        </Button>
      </div>
    </Card>
  );
}

// ------- LIQUIDADA -------
function LiquidadaPanel({ detalles, rechazos }: { detalles: DetalleOrden[]; rechazos: ReturnType<typeof useERP<any>> }) {
  const state = useERP((s) => s);
  const rechs = rechazos as any[];
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border bg-[color:var(--status-liq-bg)]/50 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-[color:var(--status-liq)]" />
          <h2 className="font-semibold">Operación cerrada — resumen de carga</h2>
        </div>
        <DetallesTable detalles={detalles} showSubtotal />
      </Card>
      {rechs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border"><h2 className="font-semibold">Retornos registrados</h2></div>
          <Table>
            <TableHeader className="bg-secondary/60"><TableRow>
              <TableHead>SKU / Lote</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead>Motivo</TableHead><TableHead>Reingreso</TableHead><TableHead>Observaciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rechs.map((r: any) => {
                const d = detalles.find((x) => x.id === r.detalle_orden_id); if (!d) return null;
                const l = findLote(state, d.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
                const m = findMotivo(state, r.motivo_rechazo_id); const al = findAlmacen(state, r.almacen_reingreso_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell><div className="font-mono font-semibold">{v?.sku}</div><div className="text-xs text-muted-foreground">{l?.numero_lote}</div></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{r.cantidad_rechazada}</TableCell>
                    <TableCell><span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-1">{m?.codigo}</span>{m?.descripcion}</TableCell>
                    <TableCell>{al?.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.observaciones ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}