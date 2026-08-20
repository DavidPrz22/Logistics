import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { PagoEstadoBadge } from "@/components/shared/factura-badges";
import { DatePicker } from "@/components/shared/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ChevronLeft, ChevronRight, ChevronDown, HandCoins, ReceiptText } from "lucide-react";
import { useTransaccionesPagos } from "@/features/Pagos/hooks/queries/queries";
import { fechaCorta, money } from "@/features/Pagos/lib/helpers";
import { useEstadosTransaccionesPago, useTiposPago } from "@/hooks/queries/queries";

const PAGE_SIZE = 50;

const searchSchema = z.object({
  q: z.string().default(""),
  estado: z.string().default(""),
  tipo: z.string().default(""),
  desde: z.string().default(""),
  hasta: z.string().default(""),
  page: z.number().default(1),
});

export const Route = createFileRoute("/pagos/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Pagos — Historial de transacciones | Tráfico ERP" },
      { name: "description", content: "Historial de transacciones de pago: anticipos, cobros de factura y saldos a favor con filtros por estado, tipo y rango de fechas." },
      { property: "og:title", content: "Pagos — Historial de transacciones" },
      { property: "og:description", content: "Registra anticipos y cobros de factura, filtra por estado, tipo y fechas." },
    ],
  }),
  component: PagosList,
});

function PagosList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: estadosData } = useEstadosTransaccionesPago();
  const { data: tiposData } = useTiposPago();

  const { data, isLoading, error } = useTransaccionesPagos({
    page: search.page,
    limit: PAGE_SIZE,
    q: search.q || undefined,
    estado: search.estado || undefined,
    tipo: search.tipo || undefined,
    desde: search.desde || undefined,
    hasta: search.hasta || undefined,
  });
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, page: 1, ...patch }) });

  const rows = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const page = data?.meta.page ?? search.page;
  const total = data?.meta.total ?? 0;
  const totalBase = rows
    .filter((t) => t.estado === "APROBADO")
    .reduce((s, t) => s + t.montoOrigen, 0);
  const hasFilters = search.q || search.estado || search.tipo || search.desde || search.hasta;

  return (
    <div className="p-8 space-y-6 max-w-375 mx-auto">
      <PageHeader
        eyebrow="Módulo de pagos"
        title="Transacciones de pago"
        subtitle="Anticipos, cobros de factura y saldos a favor registrados en el sistema."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button aria-label="Opciones de pago">
                Crear pago
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate({ to: "/pagos/crear/anticipado" })}>
                <HandCoins className="size-4" /> Pago anticipado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/pagos/crear/factura" })}>
                <ReceiptText className="size-4" /> Cobro de factura
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search.q} onChange={(e) => setSearch({ q: e.target.value })} placeholder="Cliente, referencia o ID…" className="pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Estado</label>
          <div className="mt-1">
            <Select
              value={search.estado || "TODOS"}
              onValueChange={(v) => setSearch({ estado: v === "TODOS" ? "" : v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS" className="font-sans font-medium">Todos los estados</SelectItem>
                {estadosData?.map((estado) => (
                  <SelectItem key={estado} value={estado} className="font-sans font-medium">
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo de pago</label>
          <div className="mt-1">
            <Select
              value={search.tipo || "TODOS"}
              onValueChange={(v) => setSearch({ tipo: v === "TODOS" ? "" : v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS" className="font-sans font-medium">Todos los tipos</SelectItem>
                {tiposData?.map((tipo) => (
                  <SelectItem key={tipo} value={tipo} className="font-sans font-medium">
                    {tipo.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Desde</label>
          <div className="mt-1"><DatePicker value={search.desde} onChange={(v) => setSearch({ desde: v })} placeholder="Sin límite" /></div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Hasta</label>
          <div className="mt-1"><DatePicker value={search.hasta} onChange={(v) => setSearch({ hasta: v })} placeholder="Sin límite" /></div>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="justify-self-start md:col-span-5" onClick={() => navigate({ search: { q: "", estado: "", tipo: "", desde: "", hasta: "", page: 1 } })}>
            <X className="size-4 mr-1" /> Limpiar filtros
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente / Origen</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Cargando transacciones...</TableCell></TableRow>
            )}
            {error && (
              <TableRow><TableCell colSpan={8} className="text-center text-destructive py-12">Error al cargar las transacciones</TableCell></TableRow>
            )}
            {!isLoading && !error && rows.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Sin transacciones que coincidan con los filtros.</TableCell></TableRow>
            )}
            {!isLoading && !error && rows.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate({ to: "/pagos/$pagoId", params: { pagoId: String(p.id) } })}
              >
                <TableCell>
                  <span className="font-mono font-semibold text-primary">#{p.id}</span>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{fechaCorta(p.fecha)}</TableCell>
                <TableCell className="text-sm">{p.cliente}</TableCell>
                <TableCell className="text-xs">{p.tipo.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-sm">{p.metodo}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.referencia ?? "—"}</TableCell>
                <TableCell><PagoEstadoBadge estado={p.estado} /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">{money(p.montoOrigen)} {p.divisaSimbolo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {total} transacción(es) · total aprobado{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">{money(totalBase)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">
            {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
          </span>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => navigate({ search: (p: typeof search) => ({ ...p, page: p.page - 1 }) })}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <span className="text-sm tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => navigate({ search: (p: typeof search) => ({ ...p, page: p.page + 1 }) })}>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
