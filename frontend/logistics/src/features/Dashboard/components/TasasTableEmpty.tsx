export const TasasTableEmpty = ({ selectedRegistroId }: { selectedRegistroId: string }) => (
  <tr>
    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
      {selectedRegistroId ? 'No hay tasas para este registro' : 'Selecciona un registro de tasas'}
    </td>
  </tr>
)
