import { Rol } from 'prisma/generated/prisma/enums';
import { Usuario } from 'src/users/types/users.types';

export interface AuthResponse {
  usuario: Usuario;
  accessToken: string;
}

export interface TokenPayload {
  sub: number;
  nombreUsuario: string;
  rol: Rol | null;
}
