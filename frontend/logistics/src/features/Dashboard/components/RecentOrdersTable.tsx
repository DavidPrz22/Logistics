import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@tanstack/react-router';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ClipboardList } from 'lucide-react';
import type { ListOrdenDespacho } from '@/features/Despacho/schemas/schema';

interface RecentOrdersTableProps {
  recentOrders: ListOrdenDespacho[];
}

export function RecentOrdersTable({ recentOrders }: RecentOrdersTableProps) {
  if (recentOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Órdenes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No hay órdenes registradas</p>
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
            <ClipboardList className="h-5 w-5" />
            Órdenes Recientes
          </CardTitle>
          <Link
            to="/despachos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todas →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Chofer</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    to="/despachos/$ordenId"
                    params={{ ordenId: String(order.id) }}
                    className="font-medium hover:text-accent transition-colors"
                  >
                    {order.numeroOrden}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                    {order.tipoOrden === 'DESPACHO_RUTA' ? 'Ruta' : 'Mostrador'}
                  </span>
                </TableCell>
                <TableCell className="truncate max-w-[150px]">{order.clienteNombre}</TableCell>
                <TableCell className="truncate max-w-[120px]">{order.choferNombre}</TableCell>
                <TableCell>
                  {new Date(order.FechaSalida).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={order.estado} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${order.totalOriginal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
