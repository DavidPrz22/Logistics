import { IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import type { DetalleOrdenDespacho } from '../types/despacho.types';

export class LoteSearchQueryODT {
  q?: string;
}

export class CreateOrdenODT {
  clienteId!: number;
  choferId!: number;
  fechaSalida!: Date;
  almacenTransitoId!: number;
  totalFacturadoOriginal!: number;
  @IsOptional()
  detallesOrdenDespacho!: DetalleOrdenDespacho[];
}

export class UpdateOrdenODT extends PartialType(CreateOrdenODT) {}
