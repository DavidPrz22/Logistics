import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react'
export const GenerarTasasButton = () => {

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="cursor-pointer"
      >
        <Plus className="size-4" /> Generar Tasas
      </Button>
    </>
  );
}