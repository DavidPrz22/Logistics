'use client'

import { useState } from 'react'
import { Edit2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Eye } from 'lucide-react'
import { useRegistroTasas, useTasasCambioByRegistro } from '../hooks/queries/queries'
import { useDivisas } from '@/hooks/queries/queries'
import type { TasaCambio } from '@/types/zodType'

export const ModalTasasCambio = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRegistroId, setSelectedRegistroId] = useState<number | ''>('')
  const [selectedDivisaId, setSelectedDivisaId] = useState<string>('all')
  const [editedRates, setEditedRates] = useState<{ [key: string]: number }>({})

  const { data: registroTasas = [], isLoading: isLoadingRegistros } = useRegistroTasas()
  const { data: divisas = [], isLoading: isLoadingDivisas } = useDivisas()
  const { data: tasasCambio = [], isLoading: isLoadingTasas } = useTasasCambioByRegistro(
    typeof selectedRegistroId === 'number' ? selectedRegistroId : 0
  )

  const handleEditClick = () => {
    setIsEditing(true)
    const initialEdited: { [key: string]: number } = {}
    tasasCambio.forEach((rate) => {
      initialEdited[rate.id] = Number(rate.tasaMoficada ?? rate.tasa)
    })
    setEditedRates(initialEdited)
  }

  const handleRateChange = (rateId: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditedRates({
      ...editedRates,
      [rateId]: numValue,
    })
  }

  const handleSaveClick = () => {
    setIsEditing(false)
  }

  const visibleRates = tasasCambio.filter((rate) => {
    if (selectedDivisaId === 'all') return true
    const divisaId = Number(selectedDivisaId)
    return rate.divisaOrigenId === divisaId || rate.divisaDestinoId === divisaId
  })

  const formatFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(fecha))
  }

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
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tasas de Cambio</DialogTitle>
          <DialogDescription>Gestión de tasas de divisas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="exchange-date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de registro
              </label>
              <Select
                value={selectedRegistroId ? String(selectedRegistroId) : ''}
                onValueChange={(value) => setSelectedRegistroId(value ? Number(value) : '')}
              >
                <SelectTrigger id="exchange-date" className="w-full bg-background">
                  <SelectValue placeholder="Selecciona un registro" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRegistros ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Cargando...
                    </SelectItem>
                  ) : (
                    registroTasas.map((registro) => (
                      <SelectItem key={registro.id} value={String(registro.id)}>
                        {registro.nombre || formatFecha(registro.createdAt)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-gray-500">
                Selecciona la fecha en que se registró la tasa.
              </p>
            </div>
            <div>
              <label htmlFor="currency-conversion" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por moneda
              </label>
              <Select value={selectedDivisaId} onValueChange={(value) => value && setSelectedDivisaId(value)}>
                <SelectTrigger id="currency-conversion" className="w-full bg-background">
                  <SelectValue placeholder="Selecciona una moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las conversiones</SelectItem>
                  {isLoadingDivisas ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Cargando...
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
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Divisa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Tasa Original
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Tasa Vigente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Última Actualización
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingTasas ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="size-6 animate-spin mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Cargando tasas...</p>
                    </td>
                  </tr>
                ) : visibleRates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {selectedRegistroId ? 'No hay tasas para este registro' : 'Selecciona un registro de tasas'}
                    </td>
                  </tr>
                ) : (
                  visibleRates.map((rate: TasaCambio) => (
                    <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {rate.divisaOrigen.codigo}/{rate.divisaDestino.codigo}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">{Number(rate.tasa).toFixed(4)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.0001"
                            value={editedRates[rate.id] ?? Number(rate.tasaMoficada ?? rate.tasa)}
                            onChange={(e) => handleRateChange(rate.id, e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" >
            Cerrar
          </Button>
          {!isEditing ? (
            <Button
              onClick={handleEditClick}
              disabled={!selectedRegistroId || isLoadingTasas}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
            >
              <Edit2 size={16} />
              Modificar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveClick}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Save size={16} />
                Actualizar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
