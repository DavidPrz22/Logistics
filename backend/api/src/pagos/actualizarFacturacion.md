### REGISTER INVOICE IN THE LIQUIDATION

1. For the endpoint 'orden-despacho/:id/liquidar' at /home/davidprz/projects/Logistics/backend/api/src/despacho/despacho.controller.ts, generate a documentoDeuda for that order with the necessary data from 'documentoDeuda' schema in (../../prisma/schema/pago.prisma)

2. Check for any anticipated payments from the model 'transaccionPago' vinculated to the order to calculate the balance, as it is the case of 'montoTotalBase', 'saldoPendienteBase', and 'estado'

3. Update the details panel of order to show any amounts of ancipated payments made to the order /frontend/logistics/src/features/Despacho/components/DespachoDetails
   - Update types from request in the fronted and backend to for those details data,
     /home/davidprz/projects/Logistics/backend/api/src/despacho/types/despacho.types.ts,
     /home/davidprz/projects/Logistics/frontend/logistics/src/features/Despacho/schemas/schema.ts 'ordenDespachoDetailSchema'
   - Add card to show that info conditionally
