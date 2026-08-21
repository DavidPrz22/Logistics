import { Link } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import type { RecentSearchItem } from '../store/zustandstore';

export function KardexRecentSearchChip({ item }: { item: RecentSearchItem }) {
  return (
    <Link
      to="/kardex/$skuid"
      params={{ skuid: item.sku }}
      className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
    >
      <Clock className="size-3.5 text-muted-foreground" />
      <span className="truncate">{item.nombre}</span>
      <span className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>
    </Link>
  );
}
