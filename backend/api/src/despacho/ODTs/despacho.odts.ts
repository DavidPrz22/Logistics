export class LoteSearchQueryODT {
  q?: string;
}

export class LoteSearchResultODT {
  id!: number;
  varianteId!: number;
  numeroLote!: string;
  stockActual!: number;
  fechaVencimiento!: Date;
  sku!: string;
  varianteNombre!: string;
  productoNombre!: string;
  precioBase!: number;
}
