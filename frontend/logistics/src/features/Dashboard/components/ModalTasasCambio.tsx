import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog'
import { useRegistroTasas, useTasasCambioByRegistro } from '../hooks/queries/queries'
import { useDivisas } from '@/hooks/queries/queries'
import { ModalTasasHeader } from './ModalTasasHeader'
import { TasasFilters } from './TasasFilters'
import { TasasForm } from './TasasForm'

export const ModalTasasCambio = () => {
  const [selectedRegistroId, setSelectedRegistroId] = useState<string>('')
  const [selectedDivisaId, setSelectedDivisaId] = useState<string>('Todas')

  const { data: registroTasas = [], isLoading: isLoadingRegistros } = useRegistroTasas()
  const { data: divisas = [], isLoading: isLoadingDivisas } = useDivisas()
  const { data: tasasCambio = [], isLoading: isLoadingTasas } = useTasasCambioByRegistro(
    selectedRegistroId ? Number(selectedRegistroId) : 0
  )

  const visibleRates = tasasCambio.filter((rate) => {
    if (selectedDivisaId === 'Todas') return true
    const divisaId = Number(selectedDivisaId)
    return rate.divisaOrigenId === divisaId || rate.divisaDestinoId === divisaId
  })

  const formatFechaVigencia = (fecha: string | null) => {
    if (!fecha) return '-'
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha))
  }

  return (
    <Dialog>
      <DialogTrigger render={
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer">
            <Eye className="size-4" /> Ver Tasas de Cambio</Button>
        } />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <ModalTasasHeader />

        <div className="space-y-6">
          <TasasFilters
            selectedRegistroId={selectedRegistroId}
            setSelectedRegistroId={setSelectedRegistroId}
            selectedDivisaId={selectedDivisaId}
            setSelectedDivisaId={setSelectedDivisaId}
            isLoadingRegistros={isLoadingRegistros}
            registroTasas={registroTasas}
            isLoadingDivisas={isLoadingDivisas}
            divisas={divisas}
          />

          <TasasForm
            tasasCambio={tasasCambio}
            visibleRates={visibleRates}
            isLoadingTasas={isLoadingTasas}
            selectedRegistroId={selectedRegistroId}
            formatFechaVigencia={formatFechaVigencia}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
