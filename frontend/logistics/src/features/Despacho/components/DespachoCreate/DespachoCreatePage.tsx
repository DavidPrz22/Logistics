import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Info } from "lucide-react";
import { useAlmacenes, useChoferes, useClientes } from "@/hooks/queries/queries";
import { useOrdenDespachoDetail } from "../../hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LineaBorrador } from "../../types/types";
import { HeaderForm } from "./HeaderForm";
import { LineaBorradorAddRow } from "./LineaBorradorAddRow";
import { LineaBorradorTable } from "./LineaBorradorTable";
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordenDespachoSchema, type OrdenDespacho } from "../../schemas/schema";
import { useCreateOrdenDespachoMutation, useUpdateOrdenDespachoMutation } from "../../hooks/mutations/mutations";
import type { LoteSearchResult } from "@/features/Despacho/schemas/schema";


interface DespachoCreatePageProps {
  ordenId?: number;
  isEdit?: boolean;
}

export function DespachoCreatePage({ ordenId, isEdit = false }: DespachoCreatePageProps) {
  
  const navigate = useNavigate();
  const { data: clientes = [] } = useClientes();
  const { data: choferes = [] } = useChoferes();
  const { data: almacenes = [] } = useAlmacenes();
  
  const shouldLoadDetail = isEdit && !!ordenId;
  const { data: ordenDetail, isLoading: isLoadingDetail } = useOrdenDespachoDetail(ordenId ?? 0, { enabled: shouldLoadDetail });

  const [lineas, setLineas] = useState<LineaBorrador[]>(
    ordenDetail ? ordenDetail.detalles.map(d => ({
        key: crypto.randomUUID(),
        id: d.id,
        sku: d.sku,
        variante_nombre: d.varianteNombre,
        lote_id: d.loteId,
        numero_lote: d.numeroLote,
        stock_actual: d.stockActualLote,
        cantidad: d.cantidadEnviada,
        precio: d.precioUnitario,
      })): []);

  const { mutateAsync: createOrdenMutation, isPending: isCreatePending } = useCreateOrdenDespachoMutation();
  const { mutateAsync: updateOrdenMutation, isPending: isUpdatePending } = useUpdateOrdenDespachoMutation(ordenId ?? 0);

  const isPending = isCreatePending || isUpdatePending;

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isValid },
  } = useForm<OrdenDespacho>({
    resolver: zodResolver(ordenDespachoSchema),
    mode: "onChange",
    defaultValues: {
      clienteId: ordenDetail?.clienteId,
      choferId: ordenDetail?.choferId ?? undefined,
      almacenTransitoId: ordenDetail?.almacenTransitoId,
      fechaSalida: ordenDetail?.fechaSalida ? new Date(ordenDetail.fechaSalida) : new Date(),
      saldoNetoCobrar: ordenDetail?.saldoNetoCobrar,
      detallesOrdenDespacho: [],
    }
  });

  useEffect(() => {
    const detallesFormateados = lineas.map(l => ({
        id: l.id || undefined,
        loteId: l.lote_id,
        cantidadEnviada: Number(l.cantidad),
        precioUnitario: Number(l.precio)
    }));
  
    setValue("detallesOrdenDespacho", detallesFormateados, { shouldValidate: true });
  }, [lineas, setValue]);

  const total = lineas.reduce((s, l) => s + Number(l.cantidad) * Number(l.precio), 0);
  
  useEffect(() => {
    setValue('saldoNetoCobrar', total)
  }, [total, setValue]);

  const clienteId = watch("clienteId");
  const choferId = watch("choferId");
  const almacenTransitoId = watch("almacenTransitoId");
  const fechaSalida = watch("fechaSalida");

  const onSubmit: SubmitHandler<OrdenDespacho> = async (data: OrdenDespacho) => {
    if (isEdit && ordenId) {
      await updateOrdenMutation(data);
      toast.success("Orden actualizada correctamente");
    } else {
      await createOrdenMutation(data);
      toast.success("Orden creada en estado PREPARACIÓN");
    }
    navigate({ to: "/despachos" });
  };

  const handleSelectLote = (lote: LoteSearchResult) => {
    const isDuplicate = lineas.some(l => l.lote_id === lote.id);
    
    if (isDuplicate) {
      toast.error("Este lote ya está en la lista");
      return;
    }

    const newLinea: LineaBorrador = {
      key: crypto.randomUUID(),
      sku: lote.sku,
      variante_nombre: lote.varianteNombre,
      lote_id: lote.id,
      numero_lote: lote.numeroLote,
      stock_actual: lote.stockActual,
      cantidad: 1,
      precio: lote.precioBase,
    };

    setLineas(prev => [...prev, newLinea]);
    toast.success(`Lote ${lote.numeroLote} añadido`);
  };

  const updateLinea = (idx: number, patch: Partial<LineaBorrador>) => setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));
  const removeLinea = (idx: number) => setLineas((prev) => prev.filter((_, i) => i !== idx));

  const disabledLotes = lineas.map(l => l.lote_id);

  if (isEdit && isLoadingDetail) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-100">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Cargando orden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        eyebrow={isEdit ? `Editando orden ${ordenDetail?.numeroOrden}` : "Nueva orden de despacho"}
        title={isEdit ? "Editar orden" : "Crear orden"}
        subtitle={isEdit 
          ? "Modifica los detalles de la orden antes de despachar."
          : "Se registra en PREPARACIÓN. Podrás editar componentes antes de despachar a EN_RUTA."
        }
        actions={<Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver</Link>}
      />

      <HeaderForm
        cliente={clienteId ? String(clienteId) : ""} 
        chofer={choferId ? String(choferId) : ""} 
        almacen={almacenTransitoId ? String(almacenTransitoId) : ""} 
        fecha={fechaSalida ? fechaSalida.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
        clientes={clientes} choferes={choferes} almacenes={almacenes}
        onClienteChange={(v) => setValue("clienteId", Number(v), { shouldValidate: true })}
        onChoferChange={(v) => setValue("choferId", Number(v), { shouldValidate: true })}
        onAlmacenChange={(v) => setValue("almacenTransitoId", Number(v), { shouldValidate: true })}
        onFechaChange={(v) => setValue("fechaSalida", new Date(v), { shouldValidate: true })}
      />

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Detalle de carga</h2>
          <p className="text-xs text-muted-foreground mt-1">{isEdit ? "Añade, modifica o elimina lotes de la orden." : "Opcional en creación. Podrás añadir lotes desde el panel de detalle antes de despachar."}</p>
        </div>

        <LineaBorradorAddRow onSelectLote={handleSelectLote} disabledLotes={disabledLotes} />

        <LineaBorradorTable lineas={lineas} onUpdateLinea={updateLinea} onRemoveLinea={removeLinea} />

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground max-w-md"><Info className="size-4 shrink-0 mt-0.5" /> {isEdit ? "Guarda los cambios para actualizar la orden." : 'El botón "Despachar" en el detalle se activa solo cuando hay al menos una línea.'}</div>
          <div className="text-right">
            <div className="text-xs uppercase text-muted-foreground">Total facturado</div>
            <div className="text-2xl font-bold font-mono tabular-nums">${total.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to="/despachos" className="inline-flex items-center px-4 py-2 text-sm rounded-md border border-border hover:bg-muted">Cancelar</Link>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={!isValid || isPending} 
          className="bg-primary text-primary-foreground"
        >
          {isPending ? (isEdit ? "Guardando..." : "Creando...") : (isEdit ? "Guardar cambios" : "Crear orden")}
        </Button>
      </div>
    </div>
  );
}
