import { TasasTableLoading } from './TasasTableLoading'
import { TasasTableEmpty } from './TasasTableEmpty'
import { TasaTableRow } from './TasaTableRow'
import type { TasaCambio } from '@/types/zodType'

interface TasasTableProps {
  isLoadingTasas: boolean
  visibleRates: TasaCambio[]
  selectedRegistroId: string
  isEditing: boolean
  formatFechaVigencia: (fecha: string | null) => string
}

export const TasasTable = ({
  isLoadingTasas,
  visibleRates,
  selectedRegistroId,
  isEditing,
  formatFechaVigencia,
}: TasasTableProps) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Divisa</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tasa Original</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tasa Vigente</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Origen</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Última Actualización</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoadingTasas ? (
            <TasasTableLoading />
          ) : visibleRates.length === 0 ? (
            <TasasTableEmpty selectedRegistroId={selectedRegistroId} />
          ) : (
            visibleRates.map((rate) => (
              <TasaTableRow
                key={rate.id}
                rate={rate}
                isEditing={isEditing}
                formatFechaVigencia={formatFechaVigencia}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
