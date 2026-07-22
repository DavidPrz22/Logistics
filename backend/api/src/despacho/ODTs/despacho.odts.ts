import { IsArray, IsInt, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class LoteSearchQueryODT {
  @IsOptional()
  q?: string;
}

export class DetalleOrdenDespachoODT {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsInt()
  loteId!: number;

  @IsInt()
  cantidadEnviada!: number;

  @IsNumber()
  precioUnitario!: number;
}

export class CreateOrdenODT {
  @IsInt()
  clienteId!: number;

  @IsInt()
  choferId!: number;

  @Type(() => Date)
  fechaSalida!: Date;

  @IsInt()
  almacenTransitoId!: number;

  @IsNumber()
  totalFacturadoOriginal!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleOrdenDespachoODT)
  detallesOrdenDespacho?: DetalleOrdenDespachoODT[];
}

export class UpdateOrdenODT extends PartialType(CreateOrdenODT) {}

export class UpdateDetallesOrdenODT {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleOrdenDespachoODT)
  detalles!: DetalleOrdenDespachoODT[];
}
