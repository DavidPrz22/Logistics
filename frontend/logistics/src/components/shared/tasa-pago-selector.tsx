import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTasasCambiobyDate, useTasasCambio } from "@/features/Pagos/hooks/queries/queries";
import type { TasaCambio, RegistroTasas } from "@/types/zodType";

export interface ComboboxItem { value: string; label: string; hint?: string; }

export function Combobox({ items, value, onChange, placeholder = "Seleccionar…", empty = "Sin resultados", className }: {
  items: ComboboxItem[]; value?: string; onChange: (v: string) => void; placeholder?: string; empty?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = items.find((i) => i.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !current && "text-muted-foreground", className)} />}>
        <span className="truncate">{current ? current.label : placeholder}</span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="p-0 pointer-events-auto" align="start">
        <Command className="w-110">
          <CommandInput placeholder="Buscar…" />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {items.map((it) => (
                <CommandItem key={it.value} value={`${it.label} ${it.hint ?? ""}`} onSelect={() => { onChange(it.value); setOpen(false); }}>
                  <Check className={cn("mr-2 size-4", value === it.value ? "opacity-100" : "opacity-0")} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{it.label}</div>
                    {it.hint && <div className="text-xs text-muted-foreground truncate">{it.hint}</div>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function TasaPagoSelector({
  fechaVigencia,
  onTasaSelect,
  value,
  divisaSelectedId,
}: {
  fechaVigencia: Date;
  onTasaSelect: (tasa: TasaCambio | null) => void;
  value?: number;
  divisaSelectedId?: number;
}) {
  const [selectedRegistroId, setSelectedRegistroId] = useState<number | null>(null);

  const fechaStr = fechaVigencia.toISOString().split("T")[0];
  const [prevFecha, setPrevFecha ] = useState(fechaStr)
  
  if ( fechaStr !== prevFecha ) {
    setPrevFecha(fechaStr)
    setSelectedRegistroId(null);
    onTasaSelect(null);
  }

  const { data: registros = [], isLoading: loadingRegistros } = useTasasCambiobyDate(fechaStr);
  const { data: tasas = [], isLoading: loadingTasas } = useTasasCambio(selectedRegistroId ?? 0);


  const registroItems = registros.map((r: RegistroTasas) => ({
    value: r.id.toString(),
    label: r.nombre ?? `Registro ${r.id}`,
    hint: new Date(r.createdAt).toLocaleString(),
  }));

  const tasaItems = (divisaSelectedId ? tasas.filter((t) => t.divisaOrigen.id === divisaSelectedId) : tasas).map((t: TasaCambio) => ({
    value: t.id.toString(),
    label: `${t.divisaOrigen.codigo} → ${t.divisaDestino.codigo}`,
    hint: `Tasa: ${Number(t.tasa).toFixed(2)} (${t.fuente})`,
  }));

  const selectedRegistro = registros.find((r: RegistroTasas) => r.id === selectedRegistroId);
  const selectedTasa = tasas.find((t: TasaCambio) => t.id === value);

  return (
    <div className="space-y-3 grid grid-cols-2 gap-4">
      <div className="col-span-1">
        <label className="text-sm font-medium mb-1 block">Registro de Tasas</label>
        <Combobox
          items={registroItems}
          value={selectedRegistroId?.toString()}
          onChange={(v) => setSelectedRegistroId(Number(v))}
          placeholder={loadingRegistros ? "Cargando..." : "Seleccione registro"}
          empty="No hay registros para esta fecha"
        />
      </div>

      {selectedRegistro && (
        <div className="col-span-1">
          <label className="text-sm font-medium mb-1 block">Tasa de Cambio</label>
          <Combobox
            items={tasaItems}
            value={value?.toString()}
            onChange={(v) => {
              const tasa = tasas.find((t: TasaCambio) => t.id === Number(v));
              console.log(tasa);
              onTasaSelect(tasa ?? null);
            }}
            placeholder={loadingTasas ? "Cargando..." : "Seleccione tasa"}
            empty="No hay tasas disponibles"
          />
          {selectedTasa && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedTasa.divisaOrigen.codigo} → {selectedTasa.divisaDestino.codigo}: {Number(selectedTasa.tasa).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}