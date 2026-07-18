import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxItem { value: string; label: string; hint?: string; }

export function Combobox({ items, value, onChange, placeholder = "Seleccionar…", empty = "Sin resultados", className }: {
  items: ComboboxItem[]; value?: string; onChange: (v: string) => void; placeholder?: string; empty?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = items.find((i) => i.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !current && "text-muted-foreground", className)}>
          <span className="truncate">{current ? current.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] pointer-events-auto" align="start">
        <Command>
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