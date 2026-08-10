import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";

export interface AsyncComboboxItem {
  value: string;
  label: string;
  hint?: string;
}

interface AsyncSearchComboboxProps {
  items: AsyncComboboxItem[];
  loading: boolean;
  value?: string;
  onChange: (v: string) => void;
  onSearch: (q: string) => void;
  placeholder?: string;
  empty?: string;
  searchPlaceholder?: string;
  minChars?: number;
  className?: string;
}

export function AsyncSearchCombobox({
  items,
  loading,
  value,
  onChange,
  onSearch,
  placeholder = "Seleccionar…",
  empty = "Sin resultados",
  searchPlaceholder = "Buscar…",
  minChars = 3,
  className,
}: AsyncSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);

  useEffect(() => {
    if (debouncedSearch.length >= minChars) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, minChars, onSearch]);

  const current = items.find((i) => i.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between font-normal", !current && "text-muted-foreground", className)}
          />
        }
      >
        <span className="truncate">{current ? current.label : placeholder}</span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="p-0 pointer-events-auto" align="start">
        <Command className="w-110">
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && debouncedSearch.length < minChars && (
              <CommandEmpty>Escribe al menos {minChars} caracteres para buscar</CommandEmpty>
            )}
            {!loading && debouncedSearch.length >= minChars && items.length === 0 && (
              <CommandEmpty>{empty}</CommandEmpty>
            )}
            {!loading && items.length > 0 && (
              <CommandGroup>
                {items.map((it) => (
                  <CommandItem
                    key={it.value}
                    value={`${it.label} ${it.hint ?? ""}`}
                    onSelect={() => {
                      onChange(it.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 size-4", value === it.value ? "opacity-100" : "opacity-0")} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{it.label}</div>
                      {it.hint && <div className="text-xs text-muted-foreground truncate">{it.hint}</div>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
