import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { erpActions, findLote, findVariante, useERP } from "@/lib/erp-store";
import { useAlmacenes } from "@/hooks/queries/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/combobox";
import type { DetalleOrdenDetail } from "../../schemas/schema";
import type { DetalleLiq, RechazoDraft } from "../../types/types";

interface LiquidacionFormProps {
  ordenId: number;
  detalles: DetalleOrdenDetail[];
  onCancel: () => void;
}

export function LiquidacionForm({ ordenId, detalles, onCancel }: LiquidacionFormProps) {
  const state = useERP((s) => s);
  const { data: almacenes = [] } = useAlmacenes();
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
      <div className="p-4 border-b border-border bg-(--status-liq-bg)/40">
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
                        <Combobox items={almacenes.filter((a) => a.tipo !== "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} value={rc.almacen_id} onChange={(v) => updRechazo(idx, ri, { almacen_id: v })} />
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
        <Button onClick={submit} disabled={hasErrors} className="bg-(--status-liq) text-white hover:brightness-95">
          <CheckCircle2 className="size-4 mr-1" /> Confirmar liquidación
        </Button>
      </div>
    </Card>
  );
}
