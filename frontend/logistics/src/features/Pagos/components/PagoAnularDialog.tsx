import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Ban } from "lucide-react";
import { money } from "../lib/helpers";
import type { TransaccionPagoDetalle } from "../schemas/schemas";

interface PagoAnularDialogProps {
  transaccion: TransaccionPagoDetalle;
  onConfirm: (motivo: string) => void;
  isPending: boolean;
}

export function PagoAnularDialog({ transaccion, onConfirm, isPending }: PagoAnularDialogProps) {
  const [motivo, setMotivo] = useState("");

  const handleConfirm = () => {
    if (motivo.trim().length < 4) return;
    onConfirm(motivo.trim());
    setMotivo("");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 ml-auto"
      >
        <Ban className="size-4" /> Anular pago
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anular transacción #{transaccion.id}</AlertDialogTitle>
          <AlertDialogDescription>
            El monto de {money(transaccion.montoEquivalenteBase)} USD se reincorporará al saldo pendiente
            {transaccion.documento ? " del documento vinculado" : " de la orden"} y su
            estado se recalculará. Acción restringida a administración.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo de la anulación (mín. 4 caracteres)"
          maxLength={140}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={motivo.trim().length < 4 || isPending}
          >
            {isPending ? "Anulando..." : "Confirmar anulación"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
