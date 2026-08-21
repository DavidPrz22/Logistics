import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { PagosForm } from "@/features/Pagos/components/PagosForm";
import { SeleccionResumen } from "@/features/Pagos/components/SeleccionResumen";
import { BackToPagosLink, CancelButton } from "@/features/Pagos/components/PagoPageActions";
import { Card } from "@/components/ui/card";
import { useState, useCallback } from "react";
import type { OrdenPendiente, FacturaPendiente, CrearPagoInput } from "@/features/Pagos/schemas/schemas";
import { z } from "zod";
import { useRegistrarPagoMutation } from "@/features/Pagos/hooks/mutations/mutations";
import usePagosStore from "@/features/Pagos/store/zustandstore";

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
  const { tasaAplicada, divisa, setTasaAplicada } = usePagosStore();
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
    registrarPagoMutation.mutate(
      {
        data,
        documentoId: factura?.id,
        ordenId: orden?.id,
      },
      {
        onSuccess: () => {
          setTasaAplicada(null);
          navigate({ to: "/pagos" });
        },
      }
    );
  }, [registrarPagoMutation, navigate, setTasaAplicada, factura, orden]);

  const isAnticipo = pagoTipo === "anticipado";
  const selectedSaldo = isAnticipo ? orden?.totalOriginal : factura?.saldoPendienteBase;

  const pageTitle = isAnticipo ? "Registrar pago anticipado" : "Registrar cobro de factura";
  const pageSubtitle = isAnticipo
    ? "Abono recibido antes de la emisión de la factura. Se cruzará automáticamente al liquidar la ruta."
    : "Pago aplicado a una factura pendiente. El saldo restante se actualizará automáticamente.";

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Módulo de pagos"
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={<BackToPagosLink />}
      />

      <SeleccionResumen
        orden={orden}
        factura={factura}
        isAnticipo={isAnticipo}
        tasaAplicada={tasaAplicada}
        divisa={divisa}
      />

      <Card className="p-6 space-y-5">
        <PagosForm
          tipoPago={isAnticipo ? "ANTICIPO" : "COBRO_FACTURA"}
          onSubmit={handleSubmit}
          saldoPendiente={selectedSaldo}
          onOrdenSelect={handleOrdenSelect}
          onFacturaSelect={handleFacturaSelect}
          ordenQueryParam={ordenQuery.orden}
          isSubmitting={registrarPagoMutation.isPending}
        />
      </Card>

      <CancelButton />
    </div>
  );
}
