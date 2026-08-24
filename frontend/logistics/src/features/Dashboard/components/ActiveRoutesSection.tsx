import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Truck, User } from 'lucide-react';
import type { ListOrdenDespacho } from '@/features/Despacho/schemas/schema';

interface ActiveRoutesSectionProps {
  activeRoutes: ListOrdenDespacho[];
}

export function ActiveRoutesSection({ activeRoutes }: ActiveRoutesSectionProps) {
  if (activeRoutes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Rutas Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No hay rutas activas en este momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Rutas Activas
          </CardTitle>
          <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full">
            {activeRoutes.length} en curso
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeRoutes.map((route) => (
            <Link
              key={route.id}
              to="/despachos/$ordenId"
              params={{ ordenId: String(route.id) }}
              className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{route.numeroOrden}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground truncate">{route.clienteNombre}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {route.choferNombre}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    ${route.totalOriginal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(route.FechaSalida).toLocaleTimeString('es-VE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
