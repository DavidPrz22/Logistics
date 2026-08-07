import { Loader2 } from 'lucide-react'

export const TasasTableLoading = () => (
  <tr>
    <td colSpan={5} className="px-6 py-8 text-center">
      <Loader2 className="size-6 animate-spin mx-auto" />
      <p className="text-sm text-gray-500 mt-2">Cargando tasas...</p>
    </td>
  </tr>
)
