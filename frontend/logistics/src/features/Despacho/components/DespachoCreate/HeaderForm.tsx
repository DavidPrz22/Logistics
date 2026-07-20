import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/shared/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import { Field } from "../Field";
import type { Almacen, Chofer, Cliente } from "@/types/types";

interface HeaderFormProps {
  cliente: string;
  chofer: string;
  almacen: string;
  fecha: string;
  clientes: Cliente[];
  choferes: Chofer[];
  almacenes: Almacen[];
  onClienteChange: (v: string) => void;
  onChoferChange: (v: string) => void;
  onAlmacenChange: (v: string) => void;
  onFechaChange: (v: string) => void;
}

export function HeaderForm({ cliente, chofer, almacen, fecha, clientes, choferes, almacenes, onClienteChange, onChoferChange, onAlmacenChange, onFechaChange }: HeaderFormProps) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Cabecera</h2>
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
        <Field label="Chofer">
          <Combobox items={choferes.map((c) => ({ value: String(c.id), label: c.nombre, hint: c.licenciaConducir }))} value={chofer} onChange={onChoferChange} placeholder="Elegir chofer…" />
        </Field>
        <Field label="Almacén de tránsito">
          <Combobox items={almacenes.filter((a) => a.tipo === "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} value={almacen} onChange={onAlmacenChange} placeholder="Elegir almacén…" />
        </Field>
        <Field label="Fecha de salida">
          <DatePicker value={fecha} onChange={onFechaChange} placeholder="Fecha de salida" />
        </Field>
      </div>
    </Card>
  );
}
