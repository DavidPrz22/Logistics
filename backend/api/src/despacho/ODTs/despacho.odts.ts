import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { TipoDeOrden } from 'prisma/generated/prisma/enums';

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

  @IsString()
  tipoOrden!: TipoDeOrden;

  @IsNumber()
  totalFacturado!: number;

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

  @IsNumber()
  totalFacturado!: number;
}

export class DetalleRechazoODT {
  @IsInt()
  cantidadRechazada!: number;

  @IsInt()
  motivoRechazoId!: number;

  @IsInt()
  almacenReingresoId!: number;

  @IsOptional()
  observaciones?: string;
}

export class DetalleLiquidacionODT {
  @IsInt()
  detalleId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleRechazoODT)
  rechazos!: DetalleRechazoODT[];
}

export class LiquidacionDespachoODT {
  @IsInt()
  ordenId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleLiquidacionODT)
  detallesLiquidacion!: DetalleLiquidacionODT[];
}
