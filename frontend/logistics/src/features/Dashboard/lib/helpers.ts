import type { RegistroTasas, Divisa } from "@/types/zodType";

export const getTasaRegistroNameById = (registroId: number, registroTasas: RegistroTasas[]): string => {
  const registro = registroTasas.find((r) => r.id === registroId);
  return registro?.nombre || '';
}

export const getDivisaNameById = (divisaId: number, divisas: Divisa[]): string => {
  const divisa = divisas.find((d) => d.id === divisaId);
  return divisa?.nombre || 'Todas';
}