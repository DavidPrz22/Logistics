import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "../store/zustandstore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Mail, Warehouse, ChevronsUpDown, LogIn, Pencil } from "lucide-react";
import { useLogoutMutation } from "../hooks/mutations/mutations";
import { toast } from "sonner";

const ROL_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  GERENTE: "Gerente",
  OPERADOR: "Operador de almacén",
};

export function UserMenu() {
  const usuario = useAuthStore((state) => state.usuario);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { mutateAsync: logout } = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombreUsuario);
    }
  }, [usuario]);

  if (!usuario) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogIn className="size-4" />
        Iniciar sesión
      </Link>
    );
  }

  const iniciales = nombre
    ? nombre.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "OP";

  const guardar = () => {
    updateUser({
      ...usuario,
      nombreUsuario: nombre,
    });
    setEditando(false);
    toast.success("Perfil actualizado localmente");
  };

  const cerrarSesion = () => {
    logout();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver detalles del usuario"
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
          {iniciales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-sidebar-foreground">
            {usuario.nombreUsuario}
          </span>
          <span className="block truncate text-xs text-sidebar-foreground/60">
            {usuario.rol ? (ROL_LABEL[usuario.rol] ?? usuario.rol) : "Operador"}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditando(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del usuario</DialogTitle>
            <DialogDescription>Información de la sesión activa en Tráfico ERP.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {iniciales}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{usuario.nombreUsuario}</div>
              <Badge variant="secondary" className="mt-1">
                {usuario.rol ? (ROL_LABEL[usuario.rol] ?? usuario.rol) : "Operador"}
              </Badge>
            </div>
          </div>

          <Separator />

          {editando ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="perfil-nombre">Nombre de usuario</Label>
                <Input id="perfil-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
            </div>
          ) : (
            <dl className="space-y-3 text-sm">
              <Fila icon={Mail} label="Correo" valor={usuario.correo} mono />
              <Fila icon={Warehouse} label="Rol" valor={usuario.rol ? (ROL_LABEL[usuario.rol] ?? usuario.Rol) : "Operador"} />
            </dl>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {editando ? (
              <>
                <Button variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
                <Button onClick={guardar}>Guardar cambios</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditando(true)}>
                  <Pencil className="size-4" />
                  Editar perfil
                </Button>
                <Button variant="destructive" onClick={cerrarSesion}>
                  <LogOut className="size-4" />
                  Cerrar sesión
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Fila({
  icon: Icon,
  label,
  valor,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className={`truncate text-foreground ${mono ? "font-mono text-[13px]" : ""}`}>{valor}</dd>
      </div>
    </div>
  );
}

