import { z } from 'zod';

export const RolEnum = z.enum(['ADMINISTRADOR', 'GERENTE', 'OPERADOR']);

export const loginSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombreUsuario: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    correo: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarPassword: z.string(),
    Rol: RolEnum,
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const usuarioSchema = z.object({
  id: z.number(),
  nombreUsuario: z.string(),
  correo: z.string(),
  Rol: z.string().nullable(),
});

export type Usuario = z.infer<typeof usuarioSchema>;

export const authResponseSchema = z.object({
  usuario: usuarioSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
