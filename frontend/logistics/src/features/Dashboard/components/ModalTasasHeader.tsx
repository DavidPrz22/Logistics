import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export const ModalTasasHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">Tasas de Cambio</DialogTitle>
      <DialogDescription>Gestión de tasas de divisas</DialogDescription>
    </DialogHeader>
  )
}
