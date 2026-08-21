import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PagoErrorProps {
  pagoId: string;
}

export function PagoError({ pagoId }: PagoErrorProps) {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card className="p-8 text-center space-y-3">
        <h1 className="text-xl font-semibold">Transacción #{pagoId} no encontrada</h1>
        <p className="text-sm text-muted-foreground">El pago solicitado no existe o fue eliminado.</p>
        <Button variant="secondary">
          <Link to="/pagos"><ArrowLeft className="size-4" /> Volver al listado</Link>
        </Button>
      </Card>
    </div>
  );
}
