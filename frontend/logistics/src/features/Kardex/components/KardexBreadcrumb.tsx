import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

export function KardexBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/kardex" className="hover:text-foreground">
        Kardex
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="text-foreground">{label}</span>
    </nav>
  );
}
