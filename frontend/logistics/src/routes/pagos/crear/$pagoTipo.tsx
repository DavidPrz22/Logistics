import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { PagosForm } from "@/features/Pagos/components/PagosForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import type { OrdenPendiente, FacturaPendiente, CrearPagoInput } from "@/features/Pagos/schemas/schemas";
import { z } from "zod";
import { useRegistrarPagoMutation } from "@/features/Pagos/hooks/mutations/mutations";
import usePagosStore  from "@/features/Pagos/store/zustandstore";
import { convertirDivisa } from "@/features/Pagos/lib/helpers";
import { DIVISAS } from "@/types/zodType";

const crearPagoSchema = z.object({
  orden: z.string().optional(),
});

type TcrearPago = z.infer<typeof crearPagoSchema>;

export const Route = createFileRoute("/pagos/crear/$pagoTipo")({
  validateSearch: (search) => crearPagoSchema.parse(search),
  component: CrearPago,
});

function CrearPago() {
  const { pagoTipo } = Route.useParams() as { pagoTipo: "anticipado" | "factura" };
  const ordenQuery = Route.useSearch() as TcrearPago;
  const { tasaAplicada, divisa } = usePagosStore()
  const navigate = useNavigate();
  const registrarPagoMutation = useRegistrarPagoMutation();

  const [orden, setOrden] = useState<OrdenPendiente | null>(null);
  const [factura, setFactura] = useState<FacturaPendiente | null>(null);

  const handleOrdenSelect = useCallback((selectedOrden: OrdenPendiente) => {
    setOrden(selectedOrden);
    setFactura(null);
  }, []);

  const handleFacturaSelect = useCallback((selectedFactura: FacturaPendiente) => {
    setFactura(selectedFactura);
    setOrden(null);
  }, []);

  const handleSubmit = useCallback((data: CrearPagoInput) => {
    registrarPagoMutation.mutate(data, {
      onSuccess: () => {
        navigate({ to: "/pagos" });
      },
    });
  }, [registrarPagoMutation, navigate]);

  const isAnticipo = pagoTipo === "anticipado";
  const selectedSaldo = isAnticipo ? orden?.totalOriginal : factura?.saldoPendienteBase;

  const pageTitle = isAnticipo ? "Registrar pago anticipado" : "Registrar cobro de factura";
  const pageSubtitle = isAnticipo
    ? "Abono recibido antes de la emisión de la factura. Se cruzará automáticamente al liquidar la ruta."
    : "Pago aplicado a una factura pendiente. El saldo restante se actualizará automáticamente.";

    console.log(divisa)
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Módulo de pagos"
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={<Link to="/pagos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver</Link>}
      />

      <Card className="p-6 space-y-4">
        {orden && (
          <div className="flex gap-3 ">
            <Mini label="Cliente" value={orden.clienteNombre ?? "—"} />
            <Mini label="Monto estimado usd" value={`$${orden.totalOriginal}`} />
            {tasaAplicada && <Mini label={`Monto estimado ${divisa?.codigo ?? ""}`} value={`${ divisa?.codigo + " " || "$ "}${ (
              convertirDivisa(orden.totalOriginal, tasaAplicada.tasa, divisa?.codigo ?? null, DIVISAS.USD, )
              ).toFixed(2)}`} />}
          </div>
        )}

        {factura && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Mini label="Cliente" value={factura.clienteNombre ?? "—"} />
            <Mini label="Saldo pendiente usd" value={`$${factura.saldoPendienteBase}`} />
            {tasaAplicada && <Mini label="Monto estimado" value={`${ divisa?.codigo ?? "$"}${ 
              convertirDivisa(factura.saldoPendienteBase, tasaAplicada.tasa,  DIVISAS.USD,  divisa?.codigo ?? null)
              .toFixed(2)}`} />}
          </div>
        )}

        {!orden && !factura && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Seleccione una {isAnticipo ? "orden de despacho" : "factura pendiente"} para comenzar
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-5">
        <PagosForm
          tipoPago={pagoTipo === "anticipado" ? "ANTICIPO" : "COBRO_FACTURA"}
          onSubmit={handleSubmit}
          saldoPendiente={selectedSaldo}
          onOrdenSelect={handleOrdenSelect}
          onFacturaSelect={handleFacturaSelect}
          ordenQueryParam={ordenQuery.orden}
          isSubmitting={registrarPagoMutation.isPending}
        />
      </Card>

      <div className="flex justify-end">
        <Button variant="outline"><Link to="/pagos">Cancelar</Link></Button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3 flex-1">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono tabular-nums font-semibold truncate">{value}</div>
    </div>
  );
}
