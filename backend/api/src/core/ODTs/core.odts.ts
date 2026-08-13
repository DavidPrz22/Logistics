import { IsArray, IsInt, IsNumber, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTasaCambioItemODT {
  @IsInt()
  id!: number;

  @IsNumber({ maxDecimalPlaces: 4 })
  tasaModificada!: number;
}

export class UpdateTasasCambioODT {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTasaCambioItemODT)
  tasas!: UpdateTasaCambioItemODT[];
}

export class FindTasasCambioByFechaODT {
  @IsOptional()
  @IsString()
  fecha?: string;
}
