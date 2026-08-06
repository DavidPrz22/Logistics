import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react'
import { useGenerarTasaCambioMutation } from "../hooks/mutations/mutations";

export const GenerarTasasButton = () => {
  const { mutate: generarTasaCambio } = useGenerarTasaCambioMutation();

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="cursor-pointer"
        onClick={() => generarTasaCambio()}
      >
        <Plus className="size-4" /> Generar Tasas
      </Button>
    </>
  );
}