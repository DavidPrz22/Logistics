'use client'

import { useState } from 'react'
import { Edit2, Save } from 'lucide-react'
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

interface ExchangeRate {
  id: string
  currency: string
  originalRate: number
  currentRate: number
  source: string
  registeredDate: string
  lastUpdate: string
}


export const ModalTasasCambio = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedDate, setSelectedDate] = useState('2026-01-08')
  const [selectedCurrency, setSelectedCurrency] = useState('all')
  const [rates, setRates] = useState<ExchangeRate[]>([
    {
      id: 'usd-ves-2026-01-08', currency: 'USD/VES', originalRate: 40.50, currentRate: 42.75,
      source: 'BCV Oficial', registeredDate: '2026-01-08', lastUpdate: '2026-01-08 14:30',
    },
    {
      id: 'eur-ves-2026-01-08', currency: 'EUR/VES', originalRate: 44.25, currentRate: 46.80,
      source: 'BCV Oficial', registeredDate: '2026-01-08', lastUpdate: '2026-01-08 14:30',
    },
    {
      id: 'gbp-ves-2026-01-08', currency: 'GBP/VES', originalRate: 51.10, currentRate: 53.20,
      source: 'BCV Oficial', registeredDate: '2026-01-08', lastUpdate: '2026-01-08 14:30',
    },
    {
      id: 'usd-ves-2026-01-07', currency: 'USD/VES', originalRate: 40.20, currentRate: 42.40,
      source: 'BCV Oficial', registeredDate: '2026-01-07', lastUpdate: '2026-01-07 14:25',
    },
    {
      id: 'eur-ves-2026-01-07', currency: 'EUR/VES', originalRate: 43.90, currentRate: 46.35,
      source: 'BCV Oficial', registeredDate: '2026-01-07', lastUpdate: '2026-01-07 14:25',
    },
    {
      id: 'cop-ves-2026-01-07', currency: 'COP/VES', originalRate: 0.0101, currentRate: 0.0104,
      source: 'BCV Oficial', registeredDate: '2026-01-07', lastUpdate: '2026-01-07 14:25',
    },
    {
      id: 'usd-ves-2026-01-06', currency: 'USD/VES', originalRate: 39.85, currentRate: 42.10,
      source: 'BCV Oficial', registeredDate: '2026-01-06', lastUpdate: '2026-01-06 14:10',
    },
    {
      id: 'eur-ves-2026-01-06', currency: 'EUR/VES', originalRate: 43.60, currentRate: 45.95,
      source: 'BCV Oficial', registeredDate: '2026-01-06', lastUpdate: '2026-01-06 14:10',
    },
    {
      id: 'brl-ves-2026-01-06', currency: 'BRL/VES', originalRate: 7.20, currentRate: 7.55,
      source: 'BCV Oficial', registeredDate: '2026-01-06', lastUpdate: '2026-01-06 14:10',
    },
    {
      id: 'usd-ves-2026-01-05', currency: 'USD/VES', originalRate: 39.40, currentRate: 41.80,
      source: 'BCV Oficial', registeredDate: '2026-01-05', lastUpdate: '2026-01-05 13:50',
    },
    {
      id: 'eur-ves-2026-01-05', currency: 'EUR/VES', originalRate: 43.10, currentRate: 45.65,
      source: 'BCV Oficial', registeredDate: '2026-01-05', lastUpdate: '2026-01-05 13:50',
    },
    {
      id: 'mxn-ves-2026-01-05', currency: 'MXN/VES', originalRate: 2.28, currentRate: 2.40,
      source: 'BCV Oficial', registeredDate: '2026-01-05', lastUpdate: '2026-01-05 13:50',
    },
  ])
  const [editedRates, setEditedRates] = useState<{ [key: string]: number }>({})

  const handleEditClick = () => {
    setIsEditing(true)
    const initialEdited: { [key: string]: number } = {}
    rates.forEach((rate) => {
      initialEdited[rate.id] = rate.currentRate
    })
    setEditedRates(initialEdited)
  }

  const handleRateChange = (rateId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditedRates({
      ...editedRates,
      [rateId]: numValue,
    })
  }

  const handleSaveClick = () => {
    const updatedRates = rates.map((rate) => ({
      ...rate,
      currentRate: editedRates[rate.id] ?? rate.currentRate,
    }))
    setRates(updatedRates)
    setIsEditing(false)
  }

  const registeredDates = Array.from(
    new Set(rates.map((rate) => rate.registeredDate)),
  ).sort((a, b) => b.localeCompare(a))
  const currencies = Array.from(new Set(rates.map((rate) => rate.currency))).sort()

  const visibleRates = rates.filter((rate) => {
    const matchesDate = rate.registeredDate === selectedDate
    const matchesCurrency = selectedCurrency === 'all' || rate.currency === selectedCurrency
    return matchesDate && matchesCurrency
  })

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
          {/* Date and Currency Conversion Filters */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="exchange-date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de registro
              </label>
              <Select value={selectedDate} onValueChange={(value) => value && setSelectedDate(value)}>
                <SelectTrigger id="exchange-date" className="w-full bg-background">
                  <SelectValue placeholder="Selecciona una fecha" />
                </SelectTrigger>
                <SelectContent>
                  {registeredDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Intl.DateTimeFormat('es-VE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(`${date}T12:00:00`))}
                    </SelectItem>
                  ))}
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
              <Select value={selectedCurrency} onValueChange={(value) => value && setSelectedCurrency(value)}>
                <SelectTrigger id="currency-conversion" className="w-full bg-background">
                  <SelectValue placeholder="Selecciona una moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las conversiones</SelectItem>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-gray-500">
                Selecciona una divisa para consultar su tasa vigente.
              </p>
            </div>
          </div>

          {/* Exchange Rates Table */}
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
                {visibleRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{rate.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{rate.originalRate.toFixed(4)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedRates[rate.id] ?? rate.currentRate}
                          onChange={(e) => handleRateChange(rate.id, e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="font-semibold text-gray-900">
                          {rate.currentRate.toFixed(4)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{rate.source}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{rate.lastUpdate}</p>
                    </td>
                  </tr>
                ))}
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
