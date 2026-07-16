import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useERP, findVariante, findProducto } from "@/lib/erp-store";
import type { TipoAlmacen } from "@/types/types";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Boxes, AlertTriangle, Truck, Search } from "lucide-react";

export const Route = createFileRoute("/inventario/stock")({ component: Stock });

const tipoMeta: Record<TipoAlmacen, { label: string; icon: any; tone: string; bg: string; }> = {
  PRINCIPAL: { label: "Almacén Principal", icon: Boxes, tone: "text-primary", bg: "bg-primary/5" },
  TRANSITO:  { label: "En Tránsito (calle)", icon: Truck, tone: "text-[color:var(--status-ruta)]", bg: "bg-[color:var(--status-ruta-bg)]/50" },
  MERMA:     { label: "Merma / Averías", icon: AlertTriangle, tone: "text-destructive", bg: "bg-destructive/5" },
};

function Stock() {
  const state = useERP((s) => s);
  const [q, setQ] = useState("");
  const [almacenFiltro, setAlmacenFiltro] = useState("");

  const grupos = useMemo(() => {
    const tipos: TipoAlmacen[] = ["PRINCIPAL", "TRANSITO", "MERMA"];
    return tipos.map((tipo) => {
      const almacenes = state.almacenes.filter((a) => a.tipo === tipo);
      const rows = state.lotes.filter((l) => almacenes.some((a) => a.id === l.almacen_id));
      const total = rows.reduce((s, l) => s + l.stock_actual, 0);
      return { tipo, almacenes, rows, total };
    });
  }, [state]);

  const filas = useMemo(() => {
    return state.lotes
      .filter((l) => !almacenFiltro || String(l.almacen_id) === almacenFiltro)
      .filter((l) => {
        if (!q) return true;
        const v = findVariante(state, l.variante_id); const p = v ? findProducto(state, v.producto_id) : undefined;
        const a = state.almacenes.find((x) => x.id === l.almacen_id);
        return `${v?.sku ?? ""} ${p?.nombre ?? ""} ${l.numero_lote} ${a?.nombre ?? ""}`.toLowerCase().includes(q.toLowerCase());
      })
      .sort((a, b) => (a.almacen_id - b.almacen_id) || a.numero_lote.localeCompare(b.numero_lote));
  }, [state, q, almacenFiltro]);

  const almacenItems = [
    { value: "", label: "Todos los almacenes" },
    ...state.almacenes.map((a) => ({ value: String(a.id), label: a.nombre, hint: tipoMeta[a.tipo].label })),
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        eyebrow="Módulo de inventario"
        title="Stock actual"
        subtitle="Saldos físicos por lote y almacén. SKU en monoespaciada para contrastar contra las etiquetas de estante."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grupos.map((g) => {
          const meta = tipoMeta[g.tipo];
          return (
            <Card key={g.tipo} className={`p-4 ${meta.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><meta.icon className={`size-4 ${meta.tone}`} /><div className="text-sm font-semibold">{meta.label}</div></div>
                <div className="text-xs text-muted-foreground">{g.rows.length} lotes</div>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono tabular-nums">{g.total}</div>
              <div className="text-xs text-muted-foreground">unidades totales</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="SKU, producto, lote o almacén…" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Almacén</label>
          <div className="mt-1">
            <Combobox items={almacenItems} value={almacenFiltro} onChange={setAlmacenFiltro} placeholder="Todos los almacenes" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead className="w-48">SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Sin existencias que coincidan.</TableCell></TableRow>}
            {filas.map((l) => {
              const v = findVariante(state, l.variante_id); const p = v ? findProducto(state, v.producto_id) : undefined;
              const a = state.almacenes.find((x) => x.id === l.almacen_id);
              const meta = a ? tipoMeta[a.tipo] : undefined;
              const venc = new Date(l.fecha_vencimiento);
              const diasVenc = Math.floor((venc.getTime() - Date.now()) / 86400000);
              const alerta = diasVenc < 60;
              return (
                <TableRow key={l.id} className="hover:bg-muted/40">
                  <TableCell><span className="font-mono font-bold text-[15px] bg-secondary px-2 py-1 rounded">{v?.sku}</span></TableCell>
                  <TableCell><div className="font-medium">{p?.nombre}</div><div className="text-xs text-muted-foreground">{v?.nombre}</div></TableCell>
                  <TableCell className="font-mono text-sm">{l.numero_lote}</TableCell>
                  <TableCell><span className={`text-sm tabular-nums ${alerta ? "text-destructive font-semibold" : "text-muted-foreground"}`}>{venc.toLocaleDateString()}</span></TableCell>
                  <TableCell className="text-sm">{a?.nombre}</TableCell>
                  <TableCell>
                    {meta && (
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${meta.bg} ${meta.tone}`}>
                        <meta.icon className="size-3" />
                        {meta.label}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-lg font-bold">{l.stock_actual}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}