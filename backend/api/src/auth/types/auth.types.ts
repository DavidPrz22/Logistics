export interface AuthResponse {
  usuario: {
    id: number;
    nombreUsuario: string;
    correo: string;
    Rol: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: number;
  nombreUsuario: string;
  correo: string;
  Rol: string | null;
}
