import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacturacionPaginationProps {
  meta: { total: number; page: number; limit: number; totalPages: number };
  totalMontoPage: number;
  isFetching: boolean;
  isPlaceholderData: boolean;
  onPageChange: (page: number) => void;
}

export function FacturacionPagination({ meta, totalMontoPage, isFetching, isPlaceholderData, onPageChange }: FacturacionPaginationProps) {
  const totalPages = Math.max(1, meta.totalPages);
  const page = meta.page;
  const totalItems = meta.total;
  const startItem = totalItems === 0 ? 0 : (page - 1) * meta.limit + 1;
  const endItem = Math.min(page * meta.limit, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        {totalItems} documento(s) · monto total página{" "}
        <span className="font-mono font-semibold text-foreground tabular-nums">{totalMontoPage} Bs.</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground tabular-nums">
          {startItem}–{endItem} de {totalItems}
        </span>
        <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" /> Anterior
        </Button>
        <span className="text-sm tabular-nums">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" disabled={isPlaceholderData || page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
