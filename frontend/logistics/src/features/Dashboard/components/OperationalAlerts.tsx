import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import type { DashboardMetrics } from '../lib/useDashboardMetrics';

interface OperationalAlertsProps {
  metrics: DashboardMetrics;
}

export function OperationalAlerts({ metrics }: OperationalAlertsProps) {
  const { billing, exchangeRates } = metrics;

  const hasAlerts = billing.pendingInvoices > 0 || exchangeRates !== null;

  if (!hasAlerts) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-accent" />
          Alertas Operativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {billing.pendingInvoices > 0 && (
            <Link
              to="/facturas"
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium">Facturas Pendientes</p>
                <p className="text-xs text-muted-foreground">
                  {billing.pendingInvoices} facturas por cobrar
                </p>
              </div>
            </Link>
          )}

          {exchangeRates && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
              <div className="h-10 w-10 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tasas de Cambio</p>
                <div className="flex items-center gap-3 mt-1">
                  {exchangeRates.bcv && (
                    <span className="text-xs">
                      <span className="text-muted-foreground">BCV:</span>{' '}
                      <span className="font-medium">{Number(exchangeRates.bcv).toFixed(2)}</span>
                    </span>
                  )}
                  {exchangeRates.paralelo && (
                    <span className="text-xs">
                      <span className="text-muted-foreground">Paralelo:</span>{' '}
                      <span className="font-medium">{Number(exchangeRates.paralelo).toFixed(2)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <Link
            to="/despachos"
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">Órdenes en Ruta</p>
              <p className="text-xs text-muted-foreground">
                {metrics.operational.enRuta} órdenes requieren liquidación
              </p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
