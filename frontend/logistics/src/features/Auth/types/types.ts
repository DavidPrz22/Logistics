export interface User {
  id: number;
  nombreUsuario: string;
  correo: string;
  rol: string | null;
}

export interface JwtPayload {
  exp: number;
}
