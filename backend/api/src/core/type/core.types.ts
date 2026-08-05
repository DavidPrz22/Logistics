export interface TasaCambioItem {
  market: string;
  type: string;
  currency_pair: string;
  rate: number;
  previous_rate: number;
  previous_date: string;
  change_percentage: number;
  date: string;
  best_rate: number;
  trade_type: string;
  updated_at: string;
}

export interface DolarApiResponse {
  fuente: string;
  nombre: string;
  compra: number;
  venta: number;
  promedio: number;
  fechaActualizacion: string;
}

export interface TasaCambioMontosVEResponse {
  data: TasaCambioItem[];
  meta: {
    timestamp: string;
    sources_count: number;
  };
}
