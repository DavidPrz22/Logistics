import React from "react";
import { useForm, FormProvider, useFormContext, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/shared/date-picker";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PagoSearchCombobox } from "./PagoSearchCombobox";
import { crearPagoSchema, type CrearPagoInput, type OrdenPendiente, type FacturaPendiente } from "../schemas/schemas";
import { 
  useDivisas, 
  useTasasCambio, 
  useMetodosPago, 
  useCuentasDestino 
} from "@/hooks/queries/queries";

export function PagosForm({ 
  tipoPago,
  onSubmit, 
  saldoPendiente,
  onOrdenSelect,
  onFacturaSelect,
}: { 
  tipoPago: 'ANTICIPO' | 'COBRO_FACTURA';
  onSubmit: (data: CrearPagoInput) => void;
  saldoPendiente?: number;
  onOrdenSelect?: (orden: OrdenPendiente) => void;
  onFacturaSelect?: (factura: FacturaPendiente) => void;
}) {
  const methods = useForm<CrearPagoInput>({
    resolver: zodResolver(crearPagoSchema),
    defaultValues: {
      tipoPago: tipoPago === 'ANTICIPO' ? 'ANTICIPO' : 'COBRO_FACTURA',
      montoPago: 0,
      fechaPago: new Date(),
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <PagoCampos onOrdenSelect={onOrdenSelect} onFacturaSelect={onFacturaSelect} />
        <ConversionBreakdown saldoPendiente={saldoPendiente} />
      </form>
    </FormProvider>
  );
}

export function PagoCampos({
  onOrdenSelect,
  onFacturaSelect,
}: {
  onOrdenSelect?: (orden: OrdenPendiente) => void;
  onFacturaSelect?: (factura: FacturaPendiente) => void;
}) {
  const { control, setValue } = useFormContext<CrearPagoInput>();
  
  const { data: metodosPago = [] } = useMetodosPago();
  const { data: divisas = [] } = useDivisas();
  const { data: tasas = [] } = useTasasCambio();
  const { data: cuentasDestino = [] } = useCuentasDestino();
  
  const tipoPago = useWatch({ control, name: "tipoPago" });
  
  const metodoPagoId = useWatch({ control, name: "metodoPagoId" });
  const divisaPagoId = useWatch({ control, name: "divisaPagoId" });

  const metodo = metodosPago.find((m) => m.id === metodoPagoId);
  const requiereRef = metodo?.requiereReferencia ?? false;

  const divisaSeleccionada = divisas.find((d) => d.id === divisaPagoId);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {tipoPago === 'ANTICIPO' && (
        <Field label="ID de Orden">
          <Controller
            name="ordenId"
            control={control}
            render={({ field }) => (
              <PagoSearchCombobox 
                value={field.value?.toString()} 
                onChange={field.onChange} 
                onSelect={(item) => onOrdenSelect?.(item as OrdenPendiente)}
                tipo="orden" 
                />
            )}
          />
        </Field>
      )}

      {tipoPago === 'COBRO_FACTURA' && (
        <Field label="ID de Documento / Factura">
          <Controller
            name="documentoId"
            control={control}
            render={({ field }) => (
              <PagoSearchCombobox 
                value={field.value?.toString()} 
                onChange={field.onChange} 
                onSelect={(item) => onFacturaSelect?.(item as FacturaPendiente)}
                tipo="factura" 
                />
            )}
          />
        </Field>
      )}

      <Field label="Método de pago">
        <Controller
          name="metodoPagoId"
          control={control}
          render={({ field }) => (
            <Select 
              value={field.value ? String(field.value) : undefined} 
              onValueChange={(val) => {
                const numVal = Number(val);
                field.onChange(numVal);
                const isReq = metodosPago.find((m) => m.id === numVal)?.requiereReferencia ?? false;
                if (!isReq) setValue("numeroReferencia", undefined);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione método" />
              </SelectTrigger>
              <SelectContent>
                {metodosPago.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.descripcion} ({m.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Divisa de pago">
        <Controller
          name="divisaPagoId"
          control={control}
          render={({ field }) => (
            <Select 
              value={field.value ? String(field.value) : undefined} 
              onValueChange={(val) => field.onChange(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione divisa" />
              </SelectTrigger>
              <SelectContent>
                {divisas.map((d) => {
                  const currentTasa = d.esMonedaBase ? 1 : tasas.find((t) => t.id === d.id)?.tasa;
                  return (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.codigo} · {d.nombre} {d.esMonedaBase ? "(Base)" : currentTasa ? `(Tasa: ${currentTasa})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label={`Monto origen (${divisaSeleccionada?.codigo ?? ""})`}>
        <Controller
          name="montoPago"
          control={control}
          render={({ field }) => (
            <Input
              type="number" min="0" step="0.01" inputMode="decimal"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0.00"
              className="font-mono tabular-nums"
            />
          )}
        />
      </Field>

      <Field label="Tasa de cambio aplicada">
        <Input
          type="number"
          value={""}
          readOnly
          disabled
          className="font-mono tabular-nums bg-muted"
        />
      </Field>

      <Field label="Cuenta destino">
        <Controller
          name="cuentaDestinoId"
          control={control}
          render={({ field }) => (
            <Select 
              value={field.value ? String(field.value) : undefined} 
              onValueChange={(val) => field.onChange(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cuenta" />
              </SelectTrigger>
              <SelectContent>
                {cuentasDestino.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre} ({c.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Fecha de pago">
        <Controller
          name="fechaPago"
          control={control}
          render={({ field }) => (
            <DatePicker 
              value={field.value ? field.value.toISOString().split("T")[0] : ""} 
              onChange={(v) => field.onChange(v ? new Date(v) : undefined)} 
            />
          )}
        />
      </Field>

      {requiereRef && (
        <Field label={`Número de referencia (requerido)`}>
          <Controller
            name="numeroReferencia"
            control={control}
            render={({ field }) => (
              <Input
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="TRF-000123"
                maxLength={40}
                className="font-mono"
              />
            )}
          />
        </Field>
      )}
    </div>
  );
}


export function ConversionBreakdown({ 
  saldoPendiente 
}: { 
  saldoPendiente?: number;
}) {
  const { data: divisas = [] } = useDivisas();
  const { data: tasas = [] } = useTasasCambio();
  
  const divisaBase = divisas.find((d) => d.esMonedaBase);

  const { control } = useFormContext<CrearPagoInput>();
  const form = useWatch({ control });

  const divisa = divisas.find((d) => d.id === form.divisaPagoId);
  const base = divisaBase;
  const tasaAplicada = divisa?.esMonedaBase ? 1 : tasas.find((t) => t.id === form.tasaAplicadaId)?.tasa || 0;
  
  const montoOrigen = form.montoPago || 0;
  const equiv = Math.round((montoOrigen * tasaAplicada) * 100) / 100;
  
  const excedente = saldoPendiente !== undefined ? Math.round((equiv - saldoPendiente) * 100) / 100 : 0;

  if (!base) return null;

  return (
    <Card className="p-5 space-y-3 bg-secondary/40">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Conversión en tiempo real</div>
      <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
        <span className="text-xl font-semibold">{montoOrigen.toFixed(2)} {divisa?.codigo}</span>
        <span className="text-xs text-muted-foreground">× {tasaAplicada} {base.codigo}/{divisa?.codigo}</span>
        <ArrowRight className="size-4 text-muted-foreground" />
        <span className="text-2xl font-bold">{equiv} {base.codigo}</span>
      </div>
      {saldoPendiente !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <Line label="Saldo pendiente actual" value={String(saldoPendiente)} />
          <Line label="Saldo restante tras el pago" value={String(Math.max(0, Math.round((saldoPendiente - equiv) * 100) / 100))} />
        </div>
      )}
      {excedente > 0.009 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <span>
            El monto excede el saldo pendiente en <strong className="font-mono">{excedente}</strong>. La diferencia se registrará
            como <strong>SALDO A FAVOR</strong> del cliente.
          </span>
        </div>
      )}
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-background/60 px-3 py-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="font-mono tabular-nums font-semibold">{value}</span>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
