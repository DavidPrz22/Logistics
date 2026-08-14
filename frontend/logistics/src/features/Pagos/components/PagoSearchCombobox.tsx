import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { AsyncSearchCombobox, type AsyncComboboxItem } from "@/components/shared/async-search-combobox";
import { useOrdenesPendientes, useFacturasPendientes } from "../hooks/queries/queries";
import type { OrdenPendiente, FacturaPendiente } from "../schemas/schemas";

type PagoSearchType = "orden" | "factura";

interface PagoSearchComboboxProps {
  tipo: PagoSearchType;
  value?: string;
  onChange: (v: string) => void;
  onSelect?: (item: OrdenPendiente | FacturaPendiente) => void;
  placeholder?: string;
  className?: string;
  ordenNumeroQueryParam?: string;
}

export function PagoSearchCombobox({
  tipo,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  ordenNumeroQueryParam,
}: PagoSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState(ordenNumeroQueryParam ?? "");

  const ordenesQuery = useOrdenesPendientes(tipo === "orden" ? searchQuery : "");
  const facturasQuery = useFacturasPendientes(tipo === "factura" ? searchQuery : "");

  const query = tipo === "orden" ? ordenesQuery : facturasQuery;

  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (ordenNumeroQueryParam && query.data?.length === 1 && !hasAutoSelected.current) {
      const item = query.data[0];
      onChange(String(item.id));
      onSelect?.(item);
      hasAutoSelected.current = true;
    }
  }, [ordenNumeroQueryParam, query.data, onChange, onSelect]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const items: AsyncComboboxItem[] = useMemo(() => {
    if (!query.data) return [];

    if (tipo === "orden") {
      return (query.data as OrdenPendiente[]).map((orden ) => ({
        value: String(orden.id),
        label: `Orden ${orden.numeroOrden}`,
        hint: `${orden.clienteNombre} · ${orden.estado} · ${orden.totalOriginal}`,
      }));
    }

    return (query.data as FacturaPendiente[]).map((factura) => ({
      value: String(factura.id),
      label: `Factura #${factura.id} · Orden ${factura.numeroOrden}`,
      hint: `${factura.clienteNombre} · Saldo: ${factura.saldoPendienteBase}`,
    }));
  }, [query.data, tipo]);

  const handleSelect = useCallback((itemValue: string) => {
    onChange(itemValue);
    if (onSelect && query.data) {
      const selectedItem = query.data.find(
        (item: OrdenPendiente | FacturaPendiente) => String(item.id) === itemValue
      );
      if (selectedItem) {
        onSelect(selectedItem);
      }
    }
  }, [onChange, onSelect, query.data]);

  const defaultPlaceholder = tipo === "orden"
    ? "Buscar orden de despacho…"
    : "Buscar factura pendiente…";

  return (
    <AsyncSearchCombobox
      items={items}
      loading={query.isLoading}
      value={value}
      onChange={handleSelect}
      onSearch={handleSearch}
      placeholder={placeholder ?? defaultPlaceholder}
      empty="No se encontraron resultados"
      searchPlaceholder={tipo === "orden" ? "Buscar por número de orden…" : "Buscar por ID o número de orden…"}
      className={className}
    />
  );
}
