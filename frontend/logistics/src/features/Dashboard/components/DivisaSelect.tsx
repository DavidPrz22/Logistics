import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Divisa } from '@/types/zodType'
import { Loader2 } from 'lucide-react'

interface DivisaSelectProps {
  value: string
  onValueChange: (value: string) => void
  isLoading: boolean
  divisas: Divisa[]
}

export const DivisaSelect = ({
  value,
  onValueChange,
  isLoading,
  divisas,
}: DivisaSelectProps) => {
  return (
    <div>
      <label htmlFor="currency-conversion" className="block text-sm font-medium text-gray-700 mb-2">
        Filtrar por moneda
      </label>
      <Select value={value} onValueChange={(val) => onValueChange(val || '')}>
        <SelectTrigger id="currency-conversion" className="w-full bg-background">
          <SelectValue placeholder="Selecciona una moneda" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Todas">Todas las conversiones</SelectItem>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center">
                <Loader2 className="size-4 animate-spin mr-2" />
                Cargando...
              </div>
            </SelectItem>
          ) : (
            divisas.map((divisa) => (
              <SelectItem key={divisa.id} value={String(divisa.id)}>
                {divisa.codigo} - {divisa.nombre}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-gray-500">
        Selecciona una divisa para consultar su tasa vigente.
      </p>
    </div>
  )
}

