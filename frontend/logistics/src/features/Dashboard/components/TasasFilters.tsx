import { RegistroSelect } from './RegistroSelect'
import { DivisaSelect } from './DivisaSelect'
import type { RegistroTasas, Divisa } from "@/types/zodType";
import { getTasaRegistroNameById, getDivisaNameById } from '../lib/helpers'
interface TasasFiltersProps {
  selectedRegistroId: string
  setSelectedRegistroId: (value: string) => void
  selectedDivisaId: string
  setSelectedDivisaId: (value: string) => void
  isLoadingRegistros: boolean
  registroTasas: RegistroTasas[]
  isLoadingDivisas: boolean
  divisas: Divisa[]
}

export const TasasFilters = ({
  selectedRegistroId,
  setSelectedRegistroId,
  selectedDivisaId,
  setSelectedDivisaId,
  isLoadingRegistros,
  registroTasas,
  isLoadingDivisas,
  divisas,
}: TasasFiltersProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RegistroSelect
        value={selectedRegistroId ? getTasaRegistroNameById(Number(selectedRegistroId), registroTasas) : ''}
        onValueChange={setSelectedRegistroId}
        isLoading={isLoadingRegistros}
        registros={registroTasas}
      />
      <DivisaSelect
        value={selectedDivisaId ? getDivisaNameById(Number(selectedDivisaId), divisas) : ''}
        onValueChange={setSelectedDivisaId}
        isLoading={isLoadingDivisas}
        divisas={divisas}
      />
    </div>
  )
}
