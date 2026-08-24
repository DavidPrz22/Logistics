import { useDashboardMetrics } from '../lib/useDashboardMetrics';
import { DashboardStatsCards } from './DashboardStatsCards';
import { ActiveRoutesSection } from './ActiveRoutesSection';
import { PaymentsBreakdownChart } from './PaymentsBreakdownChart';
import { RecentOrdersTable } from './RecentOrdersTable';
import { OperationalAlerts } from './OperationalAlerts';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardMain() {
  const metrics = useDashboardMetrics();

  if (metrics.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStatsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveRoutesSection activeRoutes={metrics.activeRoutes} />
        <PaymentsBreakdownChart byMethod={metrics.treasury.byMethod} />
      </div>

      <RecentOrdersTable recentOrders={metrics.recentOrders} />

      <OperationalAlerts metrics={metrics} />
    </div>
  );
}
