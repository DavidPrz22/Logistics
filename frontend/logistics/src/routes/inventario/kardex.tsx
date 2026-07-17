import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useERP, findLote, findVariante } from "@/lib/erp-store";
import { useAlmacenes } from "@/hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowDownRight, ArrowUpRight, Lock, Search } from "lucide-react";

export const Route = createFileRoute("/inventario/kardex")({ component: Kardex });

function Kardex() {
  const state = useERP((s) => s);
  const { data: almacenes = [] } = useAlmacenes();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<"ALL" | "ENTRADA" | "SALIDA">("ALL");

  const rows = useMemo(() => {
    return [...state.movimientos].sort((a, b) => b.fecha_movimiento.localeCompare(a.fecha_movimiento)).filter((m) => {
      if (tipo !== "ALL" && m.tipo_movimiento !== tipo) return false;
      if (!q) return true;
      const l = findLote(state, m.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
      const t = `${v?.sku ?? ""} ${l?.numero_lote ?? ""} ${m.referencia}`.toLowerCase();
      return t.includes(q.toLowerCase());
    });
  }, [state, q, tipo]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        eyebrow="Módulo de inventario · Auditoría"
        title="Kardex de movimientos"
        subtitle="Registro inmutable de entradas y salidas por lote. Solo lectura — trazabilidad completa."
        actions={<span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3.5" /> Sin edición</span>}
      />

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar SKU, lote o referencia</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="ORD-2026… / KTC-350-VD…" />
          </div>
        </div>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["ALL", "ENTRADA", "SALIDA"] as const).map((t) => (
            <button key={t} onClick={() => setTipo(t)} className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${tipo === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {t === "ALL" ? "Todos" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead>Fecha / hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">Sin movimientos.</TableCell></TableRow>}
            {rows.map((m) => {
              const l = findLote(state, m.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined; const a = almacenes.find((x) => x.id === m.almacen_id);
              const ordenId = m.detalle_orden_id ? state.detalles.find((d) => d.id === m.detalle_orden_id)?.orden_id : undefined;
              return (
                <TableRow key={m.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">{new Date(m.fecha_movimiento).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase ${m.tipo_movimiento === "ENTRADA" ? "text-[color:var(--status-liq)]" : "text-[color:var(--status-ruta)]"}`}>
                      {m.tipo_movimiento === "ENTRADA" ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      {m.tipo_movimiento}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">{v?.sku ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l?.numero_lote}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-semibold">{m.cantidad}</TableCell>
                  <TableCell className="text-sm">{a?.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.usuario}</TableCell>
                  <TableCell className="text-sm">
                    {ordenId ? (
                      <Link to="/despachos/$ordenId" params={{ ordenId: String(ordenId) }} className="text-accent-foreground underline decoration-accent/50 hover:decoration-accent">{m.referencia}</Link>
                    ) : m.referencia}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}