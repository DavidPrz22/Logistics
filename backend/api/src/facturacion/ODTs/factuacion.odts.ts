import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoDocumentoDeuda, TipoDocumentoDeuda } from 'prisma/generated/prisma/enums';

export class FindAllFacturasODT {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(EstadoDocumentoDeuda)
  estado?: EstadoDocumentoDeuda;

  @IsOptional()
  @IsEnum(TipoDocumentoDeuda)
  tipo?: TipoDocumentoDeuda;

  @IsOptional()
  @IsString()
  fecha?: string;
}
