import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateTasasCambioSchema, type UpdateTasasCambio } from '../schemas/schema'
import { useUpdateTasasCambioMutation } from '../hooks/mutations/mutations'
import { toast } from 'sonner'
import { TasasTable } from './TasasTable'
import { TasasFooter } from './TasasFooter'
import type { TasaCambio } from '@/types/zodType'

interface TasasFormProps {
  tasasCambio: TasaCambio[]
  visibleRates: TasaCambio[]
  isLoadingTasas: boolean
  selectedRegistroId: string
  formatFechaVigencia: (fecha: string | null) => string
}

export const TasasForm = ({
  tasasCambio,
  visibleRates,
  isLoadingTasas,
  selectedRegistroId,
  formatFechaVigencia,
}: TasasFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const mutation = useUpdateTasasCambioMutation(
    selectedRegistroId ? Number(selectedRegistroId) : 0
  )

  const methods = useForm<UpdateTasasCambio>({
    resolver: zodResolver(updateTasasCambioSchema),
    defaultValues: { tasas: [] },
  })

  const { handleSubmit, reset, formState: { dirtyFields } } = methods

  const handleEditClick = () => {
    setIsEditing(true)
    reset({
      tasas: tasasCambio.map((rate) => ({
        id: rate.id,
        tasaModificada: Number(rate.tasaMoficada ?? rate.tasa),
      })),
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    reset({ tasas: [] })
  }

  const onSubmit = (data: UpdateTasasCambio) => {
    const dirtyTasas = data.tasas.filter((_, idx) => 
      dirtyFields.tasas?.[idx]?.tasaModificada
    )
    
    if (dirtyTasas.length === 0) {
      toast.info('No hay cambios para guardar')
      return
    }
    
    mutation.mutate({ tasas: dirtyTasas }, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TasasTable
          isLoadingTasas={isLoadingTasas}
          visibleRates={visibleRates}
          selectedRegistroId={selectedRegistroId}
          isEditing={isEditing}
          formatFechaVigencia={formatFechaVigencia}
        />
        <TasasFooter
          isEditing={isEditing}
          isLoadingTasas={isLoadingTasas}
          selectedRegistroId={selectedRegistroId}
          isPending={mutation.isPending}
          onEditClick={handleEditClick}
          onCancelEdit={handleCancelEdit}
        />
      </form>
    </FormProvider>
  )
}
