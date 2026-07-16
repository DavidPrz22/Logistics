import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { findChofer, findCliente, useERP } from "@/lib/erp-store";
import type { EstadoOrden } from "@/types/types";
import { PageHeader } from "@/components/shared/page-header";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, X } from "lucide-react";

const searchSchema = z.object({
  tab: z.string().catch("TODOS").default("TODOS"),
  q: z.string().catch("").default(""),
  chofer: z.string().catch("").default(""),
  desde: z.string().catch("").default(""),
  hasta: z.string().catch("").default(""),
});

export const Route = createFileRoute("/despachos/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: DespachosList,
});

function DespachosList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const state = useERP((s) => s);
  const ordenes = state.ordenes;

  const filtered = useMemo(() => {
    return ordenes.filter((o) => {
      if (search.tab !== "TODOS" && o.estado !== search.tab) return false;
      if (search.chofer && String(o.chofer_id) !== search.chofer) return false;
      if (search.q) {
        const cli = findCliente(state, o.cliente_id)?.nombre.toLowerCase() ?? "";
        const q = search.q.toLowerCase();
        if (!cli.includes(q) && !o.numero_orden.toLowerCase().includes(q)) return false;
      }
      if (search.desde && o.fecha_salida < search.desde) return false;
      if (search.hasta && o.fecha_salida > `${search.hasta}T23:59:59Z`) return false;
      return true;
    });
  }, [ordenes, search, state]);

  const counts: Record<string, number> = {
    TODOS: ordenes.length,
    PREPARACION: ordenes.filter((o) => o.estado === "PREPARACION").length,
    EN_RUTA: ordenes.filter((o) => o.estado === "EN_RUTA").length,
    LIQUIDADA: ordenes.filter((o) => o.estado === "LIQUIDADA").length,
  };

  const setSearch = (patch: Partial<typeof search>) => navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  const hasFilters = search.q || search.chofer || search.desde || search.hasta;

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Módulo de tráfico"
        title="Órdenes y despachos"
        subtitle="Todo lo que sale, está rodando o vuelve. Filtros persistidos en la URL — compártela con otro monitor."
        actions={
          <Link to="/despachos/crear" className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-95">
            <Plus className="size-4" /> Nueva orden
          </Link>
        }
      />

      <Tabs value={search.tab} onValueChange={(v) => setSearch({ tab: v })}>
        <TabsList className="bg-secondary">
          {(["TODOS", "PREPARACION", "EN_RUTA", "LIQUIDADA"] as const).map((t) => (
            <TabsTrigger key={t} value={t} className="data-[state=active]:bg-background">
              {t === "TODOS" ? "Todos" : t === "PREPARACION" ? "Preparación" : t === "EN_RUTA" ? "En ruta" : "Liquidadas"}
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">{counts[t]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar cliente / número</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search.q} onChange={(e) => setSearch({ q: e.target.value })} placeholder="Supermercado Nacional…" className="pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Chofer</label>
          <div className="mt-1">
            <Combobox
              items={[{ value: "", label: "Todos los choferes" }, ...state.choferes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.licencia }))]}
              value={search.chofer}
              onChange={(v) => setSearch({ chofer: v })}
              placeholder="Todos los choferes"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Desde</label>
            <div className="mt-1"><DatePicker value={search.desde} onChange={(v) => setSearch({ desde: v })} placeholder="Desde…" /></div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Hasta</label>
            <div className="mt-1"><DatePicker value={search.hasta} onChange={(v) => setSearch({ hasta: v })} placeholder="Hasta…" /></div>
          </div>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => navigate({ search: { tab: search.tab, q: "", chofer: "", desde: "", hasta: "" } })} className="justify-self-start md:col-span-4">
            <X className="size-4 mr-1" /> Limpiar filtros
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Chofer</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Facturado</TableHead>
              <TableHead className="text-right">Neto a cobrar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Sin órdenes que coincidan con los filtros.</TableCell></TableRow>
            )}
            {filtered.map((o) => (
              <TableRow
                key={o.id}
                onClick={() => navigate({ to: "/despachos/$ordenId", params: { ordenId: String(o.id) } })}
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell className="font-mono font-semibold">{o.numero_orden}</TableCell>
                <TableCell>{findCliente(state, o.cliente_id)?.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{findChofer(state, o.chofer_id)?.nombre ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{new Date(o.fecha_salida).toLocaleDateString("es-DO")}</TableCell>
                <TableCell><EstadoBadge estado={o.estado as EstadoOrden} /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">${o.total_facturado_original.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold">${o.saldo_neto_cobrar.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}