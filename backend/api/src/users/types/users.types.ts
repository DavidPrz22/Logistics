import { Rol } from 'prisma/generated/prisma/enums';

export type Usuario = {
  id: number;
  nombreUsuario: string;
  correo: string;
  fechaCreacion: Date | null;
  rol: Rol | null;
};
