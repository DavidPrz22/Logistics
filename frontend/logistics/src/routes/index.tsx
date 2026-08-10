import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Truck, } from "lucide-react";
import { ModalTasasCambio } from "@/features/Dashboard/components/ModalTasasCambio";
import { GenerarTasasButton } from "@/features/Dashboard/components/GenerarTasasButton";
export const Route = createFileRoute("/")({ component: Panel });

function Panel() {

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Panel de control</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Operación de hoy</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModalTasasCambio/>
          <GenerarTasasButton />
          <Link to="/despachos/crear" className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-95">
            <Truck className="size-4" /> Nueva orden
        </Link>
        </div>

        
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Órdenes recientes</h2>
          <Link to="/despachos" className="text-sm text-muted-foreground hover:text-foreground">Ver todas →</Link>
        </div>
        <div className="divide-y divide-border">
          
        </div>
      </Card>
    </div>
  );
}
