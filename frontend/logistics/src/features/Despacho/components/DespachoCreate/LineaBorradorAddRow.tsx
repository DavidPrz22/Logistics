import { ServerSearchCombobox } from "@/features/Despacho/components/DespachoCreate/searchCombobox";
import { Field } from "../Field";
import type { LoteSearchResult } from "@/features/Despacho/schemas/schema";

interface LineaBorradorAddRowProps {
  onSelectLote: (lote: LoteSearchResult) => void;
  disabledLotes: number[];
}

export function LineaBorradorAddRow({ onSelectLote, disabledLotes }: LineaBorradorAddRowProps) {
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Field label="Buscar variante / lote">
          <ServerSearchCombobox
            onSelect={onSelectLote}
            placeholder="Buscar SKU o lote…"
            disabledLotes={disabledLotes}
          />
        </Field>
      </div>
    </div>
  );
}
