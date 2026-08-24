import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, useAuth, type Rol } from "@/lib/auth-store";
import { AuthShell } from "@/routes/login";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/shared/combobox";
import { UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ROLES: { value: Rol; label: string }[] = [
  { value: "ADMIN", label: "Administrador" },
  { value: "TRAFICO", label: "Tráfico" },
  { value: "OPERADOR", label: "Operador de almacén" },
];

export const Route = createFileRoute("/register/")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Tráfico ERP" },
      { name: "description", content: "Registra una cuenta de operador para gestionar despachos, facturación, pagos e inventario." },
      { property: "og:title", content: "Crear cuenta — Tráfico ERP" },
      { property: "og:description", content: "Registro de operadores del sistema de logística." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [almacen, setAlmacen] = useState("");
  const [rol, setRol] = useState<Rol>("TRAFICO");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auth.hidratar();
  }, []);

  useEffect(() => {
    if (usuario) navigate({ to: "/", replace: true });
  }, [usuario, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    const res = auth.registrar({ nombre, correo, password, rol, telefono, almacen });
    if (!res.ok) {
      setError(res.error ?? "No se pudo crear la cuenta.");
      return;
    }
    setError(null);
    toast.success("Cuenta creada. Bienvenido.");
    navigate({ to: "/", replace: true });
  };

  return (
    <AuthShell titulo="Crear cuenta" subtitulo="Registra tu perfil de operador para acceder al sistema.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Pérez" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correo">Correo</Label>
          <Input id="correo" type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="juan@trafico.do" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+1 809 555 0100" />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Combobox
              value={rol}
              onChange={(v) => setRol((v as Rol) || "TRAFICO")}
              items={ROLES}
              placeholder="Selecciona rol"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="almacen">Almacén asignado</Label>
          <Input id="almacen" value={almacen} onChange={(e) => setAlmacen(e.target.value)} placeholder="Almacén Central" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar</Label>
            <Input id="confirmar" type="password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full">
          <UserPlus className="size-4" />
          Crear cuenta
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
