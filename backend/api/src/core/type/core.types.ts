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

interface P2PAd {
  price: string;
  minSingleTransAmount: string;
  maxSingleTransAmount: string;
}

interface Advertiser {
  nickName: string;
}

interface P2PAdWrapper {
  adv: P2PAd;
  advertiser: Advertiser;
}

export interface BinanceP2PResponse {
  code: string;
  message: string | null;
  data: P2PAdWrapper[];
  success: boolean;
}

export interface UpdateTasasCambioResponse {
  message: string;
  updatedCount: number;
}

export interface RegistroTasasResponse {
  id: number;
  nombre: string | null;
  createdAt: string;
}
