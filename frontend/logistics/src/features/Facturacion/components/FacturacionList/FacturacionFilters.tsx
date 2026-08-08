import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import type { FacturacionSearchParams } from "../../types/types";

interface FacturacionFiltersProps {
  search: FacturacionSearchParams;
  estadosFacturas: string[];
  tiposDocumento: string[];
  onSearchChange: (patch: Partial<FacturacionSearchParams>) => void;
  onClearFilters: () => void;
}

export function FacturacionFilters({ search, estadosFacturas, tiposDocumento, onSearchChange, onClearFilters }: FacturacionFiltersProps) {
  const hasFilters = Boolean(search.q || search.estado || search.tipo || search.fecha);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar cliente / orden</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search.q} onChange={(e) => onSearchChange({ q: e.target.value })} placeholder="Colmado La Esquina…" className="pl-9" />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Estado</label>
        <div className="mt-1">
          <Select value={search.estado || "todos"} onValueChange={(v) => onSearchChange({ estado: v === "todos" ? "" : v ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {estadosFacturas.map((e) => (
                <SelectItem key={e} value={e}>{e.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo de documento</label>
        <div className="mt-1">
          <Select value={search.tipo || "todos"} onValueChange={(v) => onSearchChange({ tipo: v === "todos" ? "" : v ?? "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {tiposDocumento.map((t) => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Fecha de emisión</label>
        <div className="mt-1"><DatePicker value={search.fecha} onChange={(v) => onSearchChange({ fecha: v })} placeholder="Cualquier fecha" /></div>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" className="justify-self-start md:col-span-4" onClick={onClearFilters}>
          <X className="size-4 mr-1" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
