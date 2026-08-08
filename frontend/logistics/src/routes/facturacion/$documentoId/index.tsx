import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { DocEstadoBadge, PagoEstadoBadge, TipoDocBadge } from "@/components/shared/factura-badges";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, HandCoins, Truck } from "lucide-react";

export const Route = createFileRoute("/facturacion/$documentoId")({
  head: () => ({
    meta: [
      { title: "Detalle de documento — Facturación | Tráfico ERP" },
      { name: "description", content: "Detalle del documento de deuda: montos, saldo pendiente y pagos aplicados." },
      { property: "og:title", content: "Detalle de documento de deuda" },
      { property: "og:description", content: "Montos, saldo pendiente y transacciones de pago vinculadas." },
    ],
  }),
  component: DocumentoDetalle,
});


function DocumentoDetalle() {
  const { documentoId } = Route.useParams();
  const doc = useFacturacion((s) => s.documentos.find((d) => d.id === Number(documentoId)));
  const pagos = useFacturacion((s) => s.transacciones.filter((t) => t.documento_id === Number(documentoId)));

  const abonado = pagos
    .filter((p) => p.estado === "APROBADO" && p.tipo_operacion === "INGRESO")
    .reduce((s, p) => s + p.monto_equivalente_base, 0);

  return (
    <div className="p-8 space-y-6 max-w-325 mx-auto">
      <PageHeader
        eyebrow={`Documento #${doc.id} · ${doc.sistema_origen === "RUTA_LIQUIDADA" ? "Ruta liquidada" : "Venta mostrador"}`}
        title={doc.identificador_cliente}
        subtitle={`Emitido el ${'FECHA A CAMBIAAAAAAAAAAAAAAR'}`}
        actions={
          <div className="flex items-center gap-3">
            {doc.estado !== "ANULADO" && doc.saldo_pendiente_base > 0 && doc.tipo_documento === "FACTURA" && (
              <Button size="sm">
                <Link to="/pagos/crear/factura" search={{ documentoId: String(doc.id) }}>
                  <HandCoins className="size-4" /> Registrar cobro
                </Link>
              </Button>
            )}
            <Link to="/facturacion" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Volver
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <TipoDocBadge tipo={doc.tipo_documento} />
        <DocEstadoBadge estado={doc.estado} />
        {esOrdenDeTrafico(doc.orden_id) ? (
          <Link
            to="/despachos/$ordenId"
            params={{ ordenId: String(doc.orden_id) }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted"
          >
            <Truck className="size-3.5" /> {doc.numero_orden} <ArrowUpRight className="size-3" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-mono text-muted-foreground">
            {doc.numero_orden}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Monto total base" value={money(doc.monto_total_base)} />
        <Stat label="Total abonado" value={money(abonado)} />
        <Stat label="Saldo pendiente" value={money(doc.saldo_pendiente_base)} strong />
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pagos vinculados</h2>
          <p className="text-xs text-muted-foreground mt-1">Haz clic en el ID de la transacción para ver su detalle completo.</p>
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/60">
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Cuenta destino</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto origen</TableHead>
                <TableHead className="text-right">Tasa</TableHead>
                <TableHead className="text-right">Equiv. base</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagos.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-10">Sin pagos registrados para este documento.</TableCell></TableRow>
              )}
              {pagos.map((p) => {
                const div = findDivisa(p.divisa_pago_id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link to="/pagos/$pagoId" params={{ pagoId: String(p.id) }} className="font-mono font-semibold text-primary underline-offset-2 hover:underline">
                        #{p.id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{fechaCorta(p.fecha_pago)}</TableCell>
                    <TableCell className="text-xs">{p.tipo_de_pago.replace(/_/g, " ")} · {p.tipo_operacion}</TableCell>
                    <TableCell>{findMetodoPago(p.metodo_pago_id)?.descripcion}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.numero_referencia ?? "—"}</TableCell>
                    <TableCell className="text-sm">{findCuenta(p.cuenta_destino_id)?.nombre ?? "—"}</TableCell>
                    <TableCell><PagoEstadoBadge estado={p.estado} /></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{p.monto_origen.toFixed(2)} {div?.codigo}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{p.tasa_aplicada}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold">{money(p.monto_equivalente_base)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono tabular-nums ${strong ? "text-3xl font-bold" : "text-2xl font-semibold"}`}>{value}</div>
    </Card>
  );
}
