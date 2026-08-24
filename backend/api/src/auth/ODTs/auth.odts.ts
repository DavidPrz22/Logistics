import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { Rol } from 'prisma/generated/prisma/enums';

export class LoginODT {
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterODT {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombreUsuario: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(Rol)
  @IsNotEmpty()
  Rol: Rol;
}
