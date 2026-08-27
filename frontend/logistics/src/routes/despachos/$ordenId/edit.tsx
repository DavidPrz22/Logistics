import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from "@/features/Auth/store/zustandstore";
import { hasPermission } from "@/features/Auth/lib/permissions";
import { DespachoCreatePage } from "@/features/Despacho/components/DespachoCreate/DespachoCreatePage";

export const Route = createFileRoute('/despachos/$ordenId/edit')({
  beforeLoad: ({ params }) => {
    const user = useAuthStore.getState().user;
    if (!hasPermission(user, "despacho:edit")) {
      throw redirect({ to: `/despachos/${params.ordenId}` });
    }
  },
  component: EditDespachoPage,
})

function EditDespachoPage() {
  const { ordenId } = Route.useParams();
  const numericId = Number(ordenId);

  return (
    <DespachoCreatePage ordenId={numericId} isEdit />
  )
}

