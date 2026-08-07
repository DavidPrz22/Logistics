import { useFormContext } from 'react-hook-form'
import type { TasaCambio } from '@/types/zodType'
import type { UpdateTasasCambio } from '../schemas/schema'

interface TasaTableRowProps {
  rate: TasaCambio
  isEditing: boolean
  formatFechaVigencia: (fecha: string | null) => string
}

export const TasaTableRow = ({ rate, isEditing, formatFechaVigencia }: TasaTableRowProps) => {
  const { register, formState: { errors }, watch } = useFormContext<UpdateTasasCambio>()
  
  const tasas = watch('tasas')
  const idx = tasas.findIndex((t) => t.id === rate.id)
  const fieldError = errors.tasas?.[idx]?.tasaModificada

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <p className="font-semibold text-gray-900">
          {rate.divisaOrigen.codigo}/{rate.divisaDestino.codigo}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-600">{Number(rate.tasa).toFixed(4)}</p>
      </td>
      <td className="px-6 py-4">
        {isEditing && idx !== -1 ? (
          <div>
            <input
              type="number"
              step="0.0001"
              {...register(`tasas.${idx}.tasaModificada` as const, { valueAsNumber: true })}
              className={`w-full px-3 py-1 border rounded text-gray-900 focus:outline-none focus:ring-2 ${
                fieldError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
            />
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError.message}</p>
            )}
          </div>
        ) : rate.tasaMoficada !== null ? (
          <div className="flex flex-col">
            <p className="font-semibold text-gray-900">
              {Number(rate.tasaMoficada).toFixed(4)}
            </p>
            <p className="text-gray-400 text-sm line-through">
              {Number(rate.tasa).toFixed(4)}
            </p>
          </div>
        ) : (
          <p className="font-semibold text-gray-900">
            {Number(rate.tasa).toFixed(4)}
          </p>
        )}
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-600 text-sm">
          {rate.fuente.replace(/_/g, ' ')}
        </p>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-600 text-sm">
          {formatFechaVigencia(rate.fechaVigencia)}
        </p>
      </td>
    </tr>
  )
}
