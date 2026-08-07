import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { RegistroTasas } from "@/types/zodType";

interface RegistroSelectProps {
  value: string
  onValueChange: (value: string) => void
  isLoading: boolean
  registros: RegistroTasas[]
}

export const RegistroSelect = ({
  value,
  onValueChange,
  isLoading,
  registros,
}: RegistroSelectProps) => {
  return (
    <div>
      <label htmlFor="exchange-date" className="block text-sm font-medium text-gray-700 mb-2">
        Fecha de registro
      </label>
      <Select value={value} onValueChange={(val) => onValueChange(val || '')}>
        <SelectTrigger id="exchange-date" className="w-full bg-background">
          <SelectValue placeholder="Selecciona un registro" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center">
                <Loader2 className="size-4 animate-spin mr-2" />
                Cargando...
              </div>
            </SelectItem>
          ) : (
            registros.map((registro) => (
              <SelectItem key={registro.id} value={String(registro.id)}>
                {registro.nombre}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-gray-500">
        Selecciona la fecha en que se registró la tasa.
      </p>
    </div>
  )
}
