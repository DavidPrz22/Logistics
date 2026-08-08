export const round2 = (n: number) => Math.round(n * 100) / 100;

export const fechaCorta = (fecha: string): string => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
};
