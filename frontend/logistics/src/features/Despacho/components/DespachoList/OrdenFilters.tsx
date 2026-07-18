import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import type { Chofer } from "@/types/types";
import type { OrdenSearchParams } from "../../types/types";

interface OrdenFiltersProps {
  search: OrdenSearchParams;
  choferes: Chofer[];
  onSearchChange: (patch: Partial<OrdenSearchParams>) => void;
  onClearFilters: () => void;
}

export function OrdenFilters({ search, choferes, onSearchChange, onClearFilters }: OrdenFiltersProps) {
  const hasFilters = search.q || search.chofer || search.desde || search.hasta;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div className="md:col-span-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar cliente / número</label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search.q} onChange={(e) => onSearchChange({ q: e.target.value })} placeholder="Supermercado Nacional…" className="pl-9" />
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Chofer</label>
        <div className="mt-1">
          <Combobox
            items={[{ value: "", label: "Todos los choferes" }, ...choferes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.licenciaConducir }))]}
            value={search.chofer}
            onChange={(v) => onSearchChange({ chofer: v })}
            placeholder="Todos los choferes"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Desde</label>
          <div className="mt-1"><DatePicker value={search.desde} onChange={(v) => onSearchChange({ desde: v })} placeholder="Desde…" /></div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Hasta</label>
          <div className="mt-1"><DatePicker value={search.hasta} onChange={(v) => onSearchChange({ hasta: v })} placeholder="Hasta…" /></div>
        </div>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="justify-self-start md:col-span-4">
          <X className="size-4 mr-1" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
