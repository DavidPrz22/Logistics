import { createFileRoute } from "@tanstack/react-router";
import { DespachoDetailsPage } from "@/features/Despacho/components/DespachoDetails/DespachoDetailsPage";

export const Route = createFileRoute("/despachos/$ordenId/")({
  component: DespachoDetailsRoute,
  notFoundComponent: () => <div className="p-12 text-center text-muted-foreground">Orden no encontrada.</div>,
});

function DespachoDetailsRoute() {
  const { ordenId } = Route.useParams();
  return <DespachoDetailsPage ordenId={ordenId} />;
}
