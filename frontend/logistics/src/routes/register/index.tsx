import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/routes/login';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/shared/combobox';
import { UserPlus, AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterInput, RolEnum } from '@/features/Auth/schemas/schemas';
import { useRegisterMutation } from '@/features/Auth/hooks/mutations/mutations';
import { useAuthStore } from '@/features/Auth/store/zustandstore';
import { Controller } from 'react-hook-form';
import { GoogleButton } from '@/features/Auth/components/GoggleButton';

const ROLES = RolEnum.options.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

export const Route = createFileRoute('/register/')({
  head: () => ({
    meta: [
      { title: 'Crear cuenta — Tráfico ERP' },
      { name: 'description', content: 'Registra una cuenta de operador para gestionar despachos, facturación, pagos e inventario.' },
      { property: 'og:title', content: 'Crear cuenta — Tráfico ERP' },
      { property: 'og:description', content: 'Registro de operadores del sistema de logística.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      rol: 'OPERADOR',
    },
  });
  console.log(watch());
  useEffect(() => {
    if (usuario) navigate({ to: '/', replace: true });
  }, [usuario, navigate]);

  const onSubmit = (data: RegisterInput) => {
    const { confirmarPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <AuthShell titulo="Crear cuenta" subtitulo="Registra tu perfil de operador para acceder al sistema.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombreUsuario">Nombre de usuario</Label>
          <Input
            id="nombreUsuario"
            placeholder="juan.perez"
            {...register('nombreUsuario')}
          />
          {errors.nombreUsuario && (
            <p className="text-sm text-destructive">{errors.nombreUsuario.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            type="email"
            placeholder="juan@trafico.do"
            {...register('correo')}
          />
          {errors.correo && (
            <p className="text-sm text-destructive">{errors.correo.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Rol</Label>
          <Controller
            name="rol"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value}
                onChange={(v) => field.onChange(v || 'OPERADOR')}
                items={ROLES}
                placeholder="Selecciona rol"
              />
            )}
          />
          {errors.rol && (
            <p className="text-sm text-destructive">{errors.rol.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar</Label>
            <Input
              id="confirmarPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmarPassword')}
            />
            {errors.confirmarPassword && (
              <p className="text-sm text-destructive">{errors.confirmarPassword.message}</p>
            )}
          </div>
        </div>

        {registerMutation.isError && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{registerMutation.error?.message || 'No se pudo crear la cuenta.'}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          <UserPlus className="size-4" />
          {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
        <GoogleButton />
      <p className="mt-5 text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
