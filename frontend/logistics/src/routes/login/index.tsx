import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Warehouse, LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/features/Auth/schemas/schemas';
import { useLoginMutation } from '@/features/Auth/hooks/mutations/mutations';
import { useAuthStore } from '@/features/Auth/store/zustandstore';

export const Route = createFileRoute('/login/')({
  head: () => ({
    meta: [
      { title: 'Iniciar sesión — Tráfico ERP' },
      { name: 'description', content: 'Accede al panel de tráfico, despachos, facturación e inventario con tu cuenta de operador.' },
      { property: 'og:title', content: 'Iniciar sesión — Tráfico ERP' },
      { property: 'og:description', content: 'Acceso de operadores al sistema de logística.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (usuario) navigate({ to: '/', replace: true });
  }, [usuario, navigate]);

  const onSubmit = (data: LoginInput) => {
    console.log(data)
    loginMutation.mutate(data);
  };

  return (
    <AuthShell
      titulo="Iniciar sesión"
      subtitulo="Ingresa tus credenciales de operador para continuar."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userName">Usuario</Label>
          <Input
            id="userName"
            type="text"
            autoComplete="username"
            placeholder="admin"
            {...register('userName')}
          />
          {errors.userName && (
            <p className="text-sm text-destructive">{errors.userName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {loginMutation.isError && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{loginMutation.error?.message || 'No se pudo iniciar sesión.'}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          <LogIn className="size-4" />
          {loginMutation.isPending ? 'Iniciando sesión...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-5 space-y-3 text-sm">
        <p className="text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export function AuthShell({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-md border-3 text-sidebar-primary-foreground">
            <Warehouse className="size-6" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">Tráfico ERP</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Logística · v1
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{titulo}</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">{subtitulo}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
