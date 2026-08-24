import { Card, CardContent } from '@/components/ui/card';
import { Truck, FileText, DollarSign, Clock } from 'lucide-react';
import type { DashboardMetrics } from '../lib/useDashboardMetrics';

interface DashboardStatsCardsProps {
  metrics: DashboardMetrics;
}

export function DashboardStatsCards({ metrics }: DashboardStatsCardsProps) {
  const { operational, billing, treasury } = metrics;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Operaciones Hoy</p>
              <p className="text-2xl font-bold">{operational.enRuta + operational.preparacion}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {operational.enRuta} en ruta · {operational.preparacion} prep. · {operational.liquidada} liq.
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Facturación Total</p>
              <p className="text-2xl font-bold">{formatCurrency(billing.totalInvoicedUSD)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {billing.pendingInvoices} facturas pendientes
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recaudación</p>
              <p className="text-2xl font-bold">{formatCurrency(treasury.totalReceived)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {treasury.paymentCount} transacciones aprobadas
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cuentas por Cobrar</p>
              <p className="text-2xl font-bold">{formatCurrency(billing.pendingAmount)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo pendiente total
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
