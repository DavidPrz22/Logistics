import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { useLotesSearch } from "@/hooks/queries/queries";
import type { LoteSearchResult } from "@/features/Despacho/schemas/schema";

export interface ComboboxItem { value: string; label: string; hint?: string; }

export function ServerSearchCombobox({ 
  value, 
  onSelect, 
  placeholder = "Buscar SKU o lote…", 
  empty = "Sin resultados",
  disabledLotes = [],
  className 
}: {
  value?: string;
  onSelect: (lote: LoteSearchResult) => void;
  placeholder?: string;
  empty?: string;
  disabledLotes?: number[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);

  const { data: lotes = [], isLoading } = useLotesSearch(debouncedSearch);

  const groupedLotes = useMemo(() => {
    const grouped = new Map<string, LoteSearchResult[]>();
    lotes.forEach((lote) => {
      const key = `${lote.sku} - ${lote.productoNombre}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(lote);
    });
    return grouped;
  }, [lotes]);

  const currentLote = lotes.find((l) => String(l.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !currentLote && "text-muted-foreground", className)}>
          <span className="truncate">{currentLote ? `${currentLote.sku} · Lote ${currentLote.numeroLote}` : placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] pointer-events-auto" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Buscando..." : debouncedSearch.length < 3 ? "Busca un lote por SKU o Código" : empty}
            </CommandEmpty>
            {Array.from(groupedLotes.entries()).map(([variantKey, lotes]) => (
              <CommandGroup key={variantKey} heading={variantKey}>
                {lotes.map((lote) => {
                  const isDisabled = disabledLotes.includes(lote.id);
                  return (
                    <CommandItem 
                      key={lote.id} 
                      value={`${lote.sku} ${lote.varianteNombre} ${lote.numeroLote}`}
                      disabled={isDisabled}
                      onSelect={() => { 
                        onSelect(lote); 
                        setOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      <Check className={cn("mr-2 size-4", value === String(lote.id) ? "opacity-100" : "opacity-0")} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">Lote {lote.numeroLote}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Stock: {lote.stockActual} · Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}