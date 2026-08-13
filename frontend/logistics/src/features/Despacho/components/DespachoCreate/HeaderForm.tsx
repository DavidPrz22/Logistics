import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { TasaPagoSelector } from "@/components/shared/tasa-pago-selector";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "../Field";
import type { Almacen, Chofer, Cliente, TasaCambio } from "@/types/types";
import type { TipoDeOrden } from "../../types/types";

interface HeaderFormProps {
  cliente: string;
  chofer: string;
  almacen: string;
  fecha: string;
  tipoOrden: TipoDeOrden;
  tasaCambioId: number | null;
  clientes: Cliente[];
  choferes: Chofer[];
  almacenes: Almacen[];
  isEdit?: boolean;
  onClienteChange: (v: string) => void;
  onChoferChange: (v: string) => void;
  onAlmacenChange: (v: string) => void;
  onFechaChange: (v: string) => void;
  onTipoOrdenChange: (v: TipoDeOrden) => void;
  onTasaCambioSelect: (tasa: TasaCambio | null) => void;
}

export function HeaderForm({ cliente, chofer, almacen, fecha, tipoOrden, tasaCambioId, clientes, choferes, almacenes, isEdit, onClienteChange, onChoferChange, onAlmacenChange, onFechaChange, onTipoOrdenChange, onTasaCambioSelect }: HeaderFormProps) {
  const fechaDate = fecha ? new Date(fecha) : null;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Cabecera</h2>
      <div>
        <Field label="Tipo de orden">
          <Select value={tipoOrden} onValueChange={(v: string | null) => v && onTipoOrdenChange(v as TipoDeOrden)} disabled={isEdit}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="DESPACHO_RUTA">Despacho a Ruta</SelectItem>
                <SelectItem value="VENTA_MOSTRADOR">Venta en Mostrador</SelectItem>
              </SelectGroup>
            </SelectContent>
        </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Cliente">
          <Combobox
            className="w-full"
            items={clientes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.direccion ?? undefined }))}
            value={cliente}
            onChange={onClienteChange}
            placeholder="Elegir cliente…"
          />
        </Field>
        {tipoOrden === 'DESPACHO_RUTA' && (
          <Field label="Chofer">
            <Combobox items={choferes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.licenciaConducir }))} value={chofer} onChange={onChoferChange} placeholder="Elegir chofer…" />
          </Field>
        )}
        <Field label="Almacén de tránsito">
          <Combobox items={almacenes.filter((a) => a.tipo === "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} value={almacen} onChange={onAlmacenChange} placeholder="Elegir almacén…" />
        </Field>
        <Field label="Fecha de salida">
          <DatePicker value={fecha} onChange={onFechaChange} placeholder="Fecha de salida" />
        </Field>
      </div>
      {fechaDate && (
          <Field label="Tasa de cambio">
            <TasaPagoSelector
              fechaVigencia={fechaDate}
              value={tasaCambioId ?? undefined}
              onTasaSelect={onTasaCambioSelect}
            />
          </Field>
      )}
    </Card>
  );
}
