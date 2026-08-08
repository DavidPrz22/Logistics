import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DocEstadoBadge, TipoDocBadge } from "@/components/shared/factura-badges";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 50;

const searchSchema = z.object({
  q: z.string().default(""),
  estado: z.string().default(""),
  tipo: z.string().default(""),
  fecha: z.string().default(""),
  page: z.number().default(1),
});

export const Route = createFileRoute("/facturacion/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Facturación — Documentos de deuda | Tráfico ERP" },
      { name: "description", content: "Listado de facturas y notas de crédito con saldo pendiente, estado de cobro y pagos aplicados." },
      { property: "og:title", content: "Facturación — Documentos de deuda" },
      { property: "og:description", content: "Consulta facturas, notas de crédito y saldos pendientes por cliente." },
    ],
  }),
  component: FacturacionList,
});

function FacturacionList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const documentos = useFacturacion((s) => s.documentos);
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, page: 1, ...patch }) });

  const filtered = useMemo(() => {
    const q = search.q.toLowerCase();
    return documentos
      .filter((d) => {
        if (q && !d.identificador_cliente.toLowerCase().includes(q) && !d.numero_orden.toLowerCase().includes(q)) return false;
        if (search.estado && d.estado !== search.estado) return false;
        if (search.tipo && d.tipo_documento !== search.tipo) return false;
        if (search.fecha && fechaCorta(d.fecha_emision) !== search.fecha) return false;
        return true;
      })
      .sort((a, b) => b.fecha_emision.localeCompare(a.fecha_emision));
  }, [documentos, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPendiente = filtered.reduce((s, d) => s + d.saldo_pendiente_base, 0);
  const hasFilters = search.q || search.estado || search.tipo || search.fecha;

  return (
    <div className="p-8 space-y-6 max-w-375 mx-auto">
      <PageHeader
        eyebrow="Módulo de facturación"
        title="Documentos de deuda"
        subtitle="Facturas y notas de crédito generadas desde rutas liquidadas y ventas de mostrador."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar cliente / orden</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search.q} onChange={(e) => setSearch({ q: e.target.value })} placeholder="Colmado La Esquina…" className="pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Estado</label>
          <div className="mt-1">
            <Combobox
            // DATA TO BE REPLACED WITH API CALL TO FETCH STATES FROM BACKEND
              items={[
                { value: "", label: "Todos los estados" },
                { value: "PENDIENTE", label: "Pendiente" },
                { value: "PAGADO_PARCIAL", label: "Pagado parcial" },
                { value: "PAGADO_TOTAL", label: "Pagado total" },
                { value: "ANULADO", label: "Anulado" },
              ]}
              value={search.estado}
              onChange={(v) => setSearch({ estado: v })}
              placeholder="Todos los estados"
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo de documento</label>
          <div className="mt-1">
            <Combobox
            // DATA TO BE REPLACED WITH API CALL TO FETCH STATES FROM BACKEND
              items={[
                { value: "", label: "Todos los tipos" },
                { value: "FACTURA", label: "Factura" },
                { value: "NOTA_CREDITO", label: "Nota de crédito" },
              ]}
              value={search.tipo}
              onChange={(v) => setSearch({ tipo: v })}
              placeholder="Todos los tipos"
            />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Fecha de emisión</label>
          <div className="mt-1"><DatePicker value={search.fecha} onChange={(v) => setSearch({ fecha: v })} placeholder="Cualquier fecha" /></div>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="justify-self-start md:col-span-4" onClick={() => navigate({ search: { q: "", estado: "", tipo: "", fecha: "", page: 1 } })}>
            <X className="size-4 mr-1" /> Limpiar filtros
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* TABLE THAT SHOW ALL DATA FOR DOCUMENTS*/}
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto total</TableHead>
              <TableHead className="text-right">Saldo pendiente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">Sin documentos que coincidan con los filtros.</TableCell></TableRow>
            )}
            {rows.map((d) => (
              <TableRow
                key={d.id}
                onClick={() => navigate({ to: "/facturacion/$documentoId", params: { documentoId: String(d.id) } })}
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell className="font-mono text-muted-foreground">#{d.id}</TableCell>
                <TableCell className="font-mono font-semibold">{d.numero_orden}</TableCell>
                <TableCell>{d.identificador_cliente}</TableCell>
                <TableCell><TipoDocBadge tipo={d.tipo_documento} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.sistema_origen === "RUTA_LIQUIDADA" ? "Ruta liquidada" : "Venta mostrador"}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{fechaCorta(d.fecha_emision)}</TableCell>
                <TableCell><DocEstadoBadge estado={d.estado} /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">{money(d.monto_total_base)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold">{money(d.saldo_pendiente_base)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {filtered.length} documento(s) · pendiente total{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">{money(totalPendiente)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => navigate({ search: (p: typeof search) => ({ ...p, page: page - 1 }) })}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <span className="text-sm tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => navigate({ search: (p: typeof search) => ({ ...p, page: page + 1 }) })}>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        ¿Buscas un pago específico? Revisa el <Link to="/pagos" className="underline hover:text-foreground">libro de transacciones</Link>.
      </p>
    </div>
  );
}
