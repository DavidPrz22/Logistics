### Update the orden despacho feature

# FRONTEND REQUIREMENTS:

1. Add a new type of order registration to 'despacho' form, "Venta En Mostrador"
2. In the form, add a select what type of form, the user is going to create
3. The type are derived from schema enum = enum TipoDeOrden {
   DESPACHO_RUTA
   VENTA_MOSTRADOR
   }
4. update how the schema handles form validation, consedering:
   - if the form is type 'VENTA_MOSTRADOR', there will no be any routes update.
     - The user can register the order, update it then change state to 'LIQUIDADA'
     - The order goes from 'PREPARACION' to 'LIQUIDADA'
     - In the frontend form, you will display PreparacionPanel.tsx and LiquidadaPanel.tsx
     - The user creates the order, then update details, and finally add liquidation details.
     - when the state is 'PREPARACION' with valid details, and the type is 'VENTA_MOSTRADOR' then you can enable a button to show liquidation panel and use it as it works now.
5. Update the types and schema to account for new order type

# BACKEND REQUIREMENTS"

1. For the create and update endpoint for 'ordenDespacho' `/home/davidprz/projects/Logistics/backend/api/src/despacho/despacho.controller.ts` update odts, accounting for the new field of and register it.
2. Include that type in the get findOneOrdenDespacho endpoint
3. for updating state, updateOrdenDespachoById, validate the type of order. If the order is type 'DESPACHO_RUTA' then it can be updated to state 'EN_RUTA', but if it is not, then you cant update state in that way.
