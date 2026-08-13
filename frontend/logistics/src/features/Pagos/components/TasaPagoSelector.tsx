import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { useTasasCambiobyDate, useTasasCambio } from '../hooks/queries/queries'
import type { TasaCambio } from '@/types/zodType'

interface TasaPagoSelectorProps {
  fechaVigencia?: Date
  onTasaSelect?: (tasa: TasaCambio | null) => void
}

export const TasaPagoSelector = ({ fechaVigencia, onTasaSelect }: TasaPagoSelectorProps) => {
  const [registroId, setRegistroId] = useState<number | null>(null)
  const [tasaId, setTasaId] = useState<number | null>(null)

  const fechaStr = fechaVigencia ? fechaVigencia.toISOString().split("T")[0] : ""
  const { data: registros = [] } = useTasasCambiobyDate(fechaStr)
  const { data: tasas = [] } = useTasasCambio(registroId ?? 0)

  const handleSelectRegistro = (value: string | null) => {
    if (!value) return
    const id = parseInt(value)
    setRegistroId(id)
    setTasaId(null)
    onTasaSelect?.(null)
  }

  const handleSelectTasa = (value: string | null) => {
    if (!value) return
    const id = parseInt(value)
    setTasaId(id)
    const selected = tasas.find((t) => t.id === id) ?? null
    onTasaSelect?.(selected)
  }

  const hasTasas = tasas.length > 0
  const selectedRegistro = registros.find((r) => r.id === registroId)
  const selectedTasa = tasas.find((t) => t.id === tasaId)

  return (
    <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Fecha de registro
        </label>
        <Select
          value={registroId ? String(registroId) : undefined}
          onValueChange={handleSelectRegistro}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Selecciona un registro">
              {selectedRegistro?.nombre}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {registros.map((registro) => (
              <SelectItem key={registro.id} value={String(registro.id)}>
                {registro.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Tasa de cambio
        </label>
        <Select
          value={tasaId ? String(tasaId) : undefined}
          onValueChange={handleSelectTasa}
          disabled={!registroId || !hasTasas}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder={hasTasas ? 'Selecciona una tasa' : 'Sin tasas disponibles'}>
              {selectedTasa && `Tasa ${selectedTasa.fuente} - ${selectedTasa.divisaOrigen.codigo} - ${selectedTasa.tasa}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tasas.map((tasa) => (
              <SelectItem key={tasa.id} value={String(tasa.id)}>
                Tasa {tasa.fuente} - {tasa.divisaOrigen.codigo} - {tasa.tasa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>

  )
}