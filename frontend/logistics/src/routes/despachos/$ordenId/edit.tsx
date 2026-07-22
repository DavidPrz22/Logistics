import { createFileRoute } from '@tanstack/react-router'
import { DespachoCreatePage } from "@/features/Despacho/components/DespachoCreate/DespachoCreatePage";

export const Route = createFileRoute('/despachos/$ordenId/edit')({
  component: EditDespachoPage,
})

function EditDespachoPage() {
  const { ordenId } = Route.useParams();
  const numericId = Number(ordenId);

  return (
    <DespachoCreatePage ordenId={numericId} isEdit />
  )
}
