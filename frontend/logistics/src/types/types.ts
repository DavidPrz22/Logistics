export type EstadoOrden = "PREPARACION" | "EN_RUTA" | "LIQUIDADA";
export type TipoAlmacen = "PRINCIPAL" | "TRANSITO" | "MERMA";
export type TipoMovimiento = "ENTRADA" | "SALIDA";

export interface Cliente { id: number; nombre: string; telefono: string | null; direccion: string | null; }
export interface Chofer { id: number; nombre: string; licenciaConducir: string; telefono: string | null; }
export interface Almacen { id: number; nombre: string; tipo: TipoAlmacen; }
export interface Divisa { id: number; codigo: string; nombre: string; esMonedaBase: boolean | null; }
export interface TasaCambio { id: number; divisaOrigenId: number; divisaDestinoId: number; tasa: number; origenTasa: string | null; fechaVigencia: string | null; divisaOrigen: Divisa; divisaDestino: Divisa; }
export interface MetodoPago { id: number; codigo: string; descripcion: string; requiereReferencia: boolean | null; }
export interface MotivoRechazo { id: number; codigo: string; descripcion: string; requiere_merma: boolean; }
export interface Producto { id: number; nombre: string; }
export interface Variante { id: number; producto_id: number; sku: string; nombre: string; precio_base: number; }
export interface Lote { id: number; variante_id: number; numero_lote: string; fecha_vencimiento: string; stock_actual: number; almacen_id: number; }

export interface DetalleRechazo {
  id: number;
  detalle_orden_id: number;
  cantidad_rechazada: number;
  motivo_rechazo_id: number;
  almacen_reingreso_id: number;
  observaciones?: string;
}


export interface OrdenDespacho {
  id: number;
  numero_orden: string;
  cliente_id: number;
  chofer_id: number | null;
  almacen_transito_id: number;
  fecha_salida: string;
  estado: EstadoOrden;
  total_facturado_original: number;
  saldo_neto_cobrar: number;
  total_rechazado: number;
}

export interface Movimiento {
  id: number;
  lote_id: number;
  almacen_id: number;
  almacen_destino_id?: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  fecha_movimiento: string;
  referencia: string;
  usuario: string;
  detalle_orden_id?: number;
}