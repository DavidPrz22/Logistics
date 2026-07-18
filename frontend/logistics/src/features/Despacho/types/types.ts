export interface LineaBorrador {
  key: string;
  lote_id: number;
  cantidad: number;
  precio: number;
}

export interface RechazoDraft {
  key: string;
  cantidad: number;
  motivo_id: string;
  almacen_id: string;
  obs: string;
}

export interface DetalleLiq {
  detalle_id: number;
  devuelta: number;
  rechazos: RechazoDraft[];
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
  desde: string;
  hasta: string;
}
