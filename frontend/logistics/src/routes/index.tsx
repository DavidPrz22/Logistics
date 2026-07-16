import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useERP, findCliente, findChofer } from "@/lib/erp-store";
import { Card } from "@/components/ui/card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Truck, Boxes, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({ component: Panel });

function Panel() {
  const ordenes = useERP((s) => s.ordenes);
  const lotes = useERP((s) => s.lotes);
  const almacenes = useERP((s) => s.almacenes);
  const state = useERP((s) => s);

  const enRuta = ordenes.filter((o) => o.estado === "EN_RUTA").length;
  const prep = ordenes.filter((o) => o.estado === "PREPARACION").length;
  const liq = ordenes.filter((o) => o.estado === "LIQUIDADA").length;
  const stockMerma = lotes.filter((l) => almacenes.find((a) => a.id === l.almacen_id)?.tipo === "MERMA").reduce((s, l) => s + l.stock_actual, 0);

  const stats = [
    { label: "En preparación", value: prep, icon: Boxes, tone: "text-[color:var(--status-prep)]" },
    { label: "En ruta", value: enRuta, icon: Truck, tone: "text-[color:var(--status-ruta)]" },
    { label: "Liquidadas", value: liq, icon: CheckCircle2, tone: "text-[color:var(--status-liq)]" },
    { label: "Unidades en merma", value: stockMerma, icon: AlertTriangle, tone: "text-destructive" },
  ];

  const recientes = [...ordenes].sort((a, b) => b.id - a.id).slice(0, 6);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Panel de control</div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Operación de hoy</h1>
        </div>
        <Link to="/despachos/crear" className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-95">
          <Truck className="size-4" /> Nueva orden
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-bold mt-2 tabular-nums">{s.value}</div>
              </div>
              <s.icon className={`size-6 ${s.tone}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Órdenes recientes</h2>
          <Link to="/despachos" className="text-sm text-muted-foreground hover:text-foreground">Ver todas →</Link>
        </div>
        <div className="divide-y divide-border">
          {recientes.map((o) => (
            <Link key={o.id} to="/despachos/$ordenId" params={{ ordenId: String(o.id) }} className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded">
              <div className="flex items-center gap-4">
                <div className="font-mono text-sm font-semibold">{o.numero_orden}</div>
                <div className="text-sm text-muted-foreground">{findCliente(state, o.cliente_id)?.nombre}</div>
                <div className="text-xs text-muted-foreground">· {findChofer(state, o.chofer_id)?.nombre ?? "Sin chofer"}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-mono tabular-nums">${o.saldo_neto_cobrar.toFixed(2)}</div>
                <EstadoBadge estado={o.estado} />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
