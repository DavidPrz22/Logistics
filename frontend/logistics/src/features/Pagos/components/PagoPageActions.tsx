import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackToPagosLink() {
  return (
    <Link
      to="/pagos"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Volver
    </Link>
  );
}

export function CancelButton() {
  return (
    <div className="flex justify-end">
      <Button variant="outline">
        <Link to="/pagos">Cancelar</Link>
      </Button>
    </div>
  );
}
