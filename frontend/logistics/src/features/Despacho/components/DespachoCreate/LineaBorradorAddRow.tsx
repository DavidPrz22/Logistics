import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/shared/combobox";
import { Field } from "../Field";
import { findVariante, useERP } from "@/lib/erp-store";
import type { Lote } from "@/types/types";

interface LineaBorradorAddRowProps {
  lotesDisponibles: Lote[];
  addLote: string;
  onAddLoteChange: (v: string) => void;
  onAdd: () => void;
}

export function LineaBorradorAddRow({ lotesDisponibles, addLote, onAddLoteChange, onAdd }: LineaBorradorAddRowProps) {
  const state = useERP((s) => s);

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Field label="Buscar variante / lote">
          <Combobox
            items={lotesDisponibles.map((l) => {
              const v = findVariante(state, l.variante_id)!;
              return { value: String(l.id), label: `${v.sku} · ${v.nombre}`, hint: `Lote ${l.numero_lote} · Stock ${l.stock_actual}` };
            })}
            value={addLote}
            onChange={onAddLoteChange}
            placeholder="Buscar SKU o lote…"
          />
        </Field>
      </div>
      <Button onClick={onAdd} disabled={!addLote}><Plus className="size-4 mr-1" /> Añadir</Button>
    </div>
  );
}
