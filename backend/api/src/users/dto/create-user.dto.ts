import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Rol } from 'prisma/generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombreUsuario!: string;

  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsEnum(Rol)
  @IsNotEmpty()
  rol!: Rol;

  @IsString()
  @IsNotEmpty()
  hashPassword!: string;
}
