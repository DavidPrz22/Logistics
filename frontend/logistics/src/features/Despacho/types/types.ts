import type { RechazoSchema } from "../schemas/schema";

export type TipoDeOrden = 'DESPACHO_RUTA' | 'VENTA_MOSTRADOR';

export interface LineaBorrador {
  key: string;
  id?: number;
  sku: string;
  variante_nombre: string;
  lote_id: number;
  numero_lote: string;
  stock_actual: number;
  cantidad: number | string;
  precio: number | string;
}

export type LiquidacionRowData = {
  id: number;
  sku: string;
  varianteNombre: string;
  numeroLote: string;
  cantidadEnviada: number;
  precioUnitario: number;
  devuelta: number;
  rechazos: RechazoSchema[];
  sumRech: number;
  problems: string[];
};


export interface DetalleLiq {
  detalleId: number;
  devuelta: number;
  rechazos: RechazoSchema[];
}

export interface EditorLinea {
  id: number;
  orden_id: number;
  lote_id: number;
  cantidad_enviada: number;
  precio_unitario: number;
  key: string;
}

export interface OrdenSearchParams {
  tab: string;
  q: string;
  chofer: string;
  tipoOrden: string;
  desde: string;
  hasta: string;
}
