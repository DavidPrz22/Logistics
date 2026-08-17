import { DIVISAS } from "@/types/zodType";

export const fechaCorta = (fecha: string): string => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const money = (amount: number): string => {
    return new Intl.NumberFormat("es-DO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};



export function convertirDivisa(
  montoOrigen: number,
  tasaValor: number,
  codigoDestino: string | null,
  codigoBase: string | null
): number {
  if (!codigoDestino || !codigoBase || codigoDestino === codigoBase) {
    return montoOrigen;
  }
  if (!tasaValor || tasaValor <= 0) {
    return montoOrigen;
  }

  if (codigoDestino === DIVISAS.VES ||( codigoDestino === DIVISAS.USD && codigoBase !== DIVISAS.VES)) {
    return Math.round(montoOrigen * tasaValor * 100) / 100;
  }
  return Math.round((montoOrigen / tasaValor) * 100) / 100;
}

export const formatStringConversion = (codigoDestino: string | null, codigoBase: string, tasaValor: number) => {
    if (codigoDestino ) {
    
      return `× ${tasaValor} ${codigoDestino}/${codigoBase}`
    }
  
    return `÷ ${tasaValor} ${codigoDestino ?? ' '}/${codigoBase}`;
}
