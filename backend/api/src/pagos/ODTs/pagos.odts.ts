import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  Min,
  Max,
  IsNumber,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BuscarOrdenesPendientesODT {
  @IsOptional()
  @IsString()
  q?: string;
}

export class BuscarFacturasPendientesODT {
  @IsOptional()
  @IsString()
  q?: string;
}

export enum EstadoTransaccionPagoODT {
  APROBADO = 'APROBADO',
  ANULADO = 'ANULADO',
  RECHAZADO = 'RECHAZADO',
}

export enum TipoDePagoODT {
  ANTICIPO = 'ANTICIPO',
  COBRO_FACTURA = 'COBRO_FACTURA',
  SALDO_A_FAVOR = 'SALDO_A_FAVOR',
}

export class FindAllTransaccionesODT {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(EstadoTransaccionPagoODT)
  estado?: EstadoTransaccionPagoODT;

  @IsOptional()
  @IsEnum(TipoDePagoODT)
  tipo?: TipoDePagoODT;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;
}

export class CrearTransaccionPagoODT {
  @IsOptional()
  @IsInt()
  documentoId?: number;

  @IsOptional()
  @IsInt()
  ordenId?: number;

  @IsInt()
  metodoPagoId!: number;

  @IsInt()
  divisaPagoId!: number;

  @IsNumber()
  montoOrigen!: number;

  @IsOptional()
  @IsInt()
  tasaAplicadaId?: number;

  @IsOptional()
  @IsString()
  numeroReferencia?: string;

  @IsOptional()
  @IsInt()
  cuentaDestinoId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  fechaPago?: string;
}

export class AnularTransaccionODT {
  @IsString()
  @MinLength(4)
  motivo!: string;
}
