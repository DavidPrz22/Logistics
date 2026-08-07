import { Edit2, Save, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogClose } from '@/components/ui/dialog'
interface TasasFooterProps {
  isEditing: boolean
  isLoadingTasas: boolean
  selectedRegistroId: string
  isPending: boolean
  onEditClick: () => void
  onCancelEdit: () => void
}

export const TasasFooter = ({
  isEditing,
  isLoadingTasas,
  selectedRegistroId,
  isPending,
  onEditClick,
  onCancelEdit,
}: TasasFooterProps) => {
  return (
    <DialogFooter className="mt-6">
      <DialogClose render={ 
            <Button
              type="button"
              variant="outline"
            >
              Cerrar
            </Button>
          }/>
      {!isEditing ? (
        <>

          <Button
            type="button"
            onClick={onEditClick}
            disabled={!selectedRegistroId || isLoadingTasas}
            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
          >
            <Edit2 size={16} />
            Modificar
          </Button>
        </>
      ) : (
        <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              disabled={isPending}
            >
              <X size={16} className="mr-1" />
              Cancelar
            </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isPending ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </>
      )}
    </DialogFooter>
  )
}
