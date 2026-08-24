import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, useAuth } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Warehouse, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Tráfico ERP" },
      { name: "description", content: "Accede al panel de tráfico, despachos, facturación e inventario con tu cuenta de operador." },
      { property: "og:title", content: "Iniciar sesión — Tráfico ERP" },
      { property: "og:description", content: "Acceso de operadores al sistema de logística." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auth.hidratar();
  }, []);

  useEffect(() => {
    if (usuario) navigate({ to: "/", replace: true });
  }, [usuario, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = auth.iniciarSesion(correo, password);
    if (!res.ok) {
      setError(res.error ?? "No se pudo iniciar sesión.");
      return;
    }
    setError(null);
    toast.success("Sesión iniciada");
    navigate({ to: "/", replace: true });
  };

  return (
    <AuthShell
      titulo="Iniciar sesión"
      subtitulo="Ingresa tus credenciales de operador para continuar."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            type="email"
            autoComplete="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="admin@trafico.do"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full">
          <LogIn className="size-4" />
          Entrar
        </Button>
      </form>

      <div className="mt-5 space-y-3 text-sm">
        <p className="text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-primary hover:underline">
            Crear cuenta
          </Link>
        </p>
        <div className="rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Demo: <span className="font-mono">admin@trafico.do</span> /{" "}
          <span className="font-mono">admin123</span>
        </div>
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
          <div className="grid size-11 place-items-center rounded-md bg-sidebar text-sidebar-primary-foreground">
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
