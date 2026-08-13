### Update the features despacho in the fronted and the backend: Manage a new fields like tasaCambio and dual-currency fields for ves  in the logic


We want to implement recording a tasaCambio field and dual currency field  to ordenDespacho model, detalleOrden

BACKEND:

1. Update odts, types and registration service methods
2. Register tasaCambioId, and ves convertion fields
3. Include the field and returning data for order details
4. Update types of order details
5. Update the product details registration implementing the dual currency records

FRONTEND:

FOR DESPACHO:

1. Make the tasaCambio field required, follow the flow of frontend\logistics\src\components\shared\tasa-pago-selector.tsx component, add a field to select a date then a list of record and finally the tasaCambio record that we will use in the form.
2. Update the form, schema, types in creation, updating and showing details data of orders by adding the fields.
3. In the details panel, display the origen, simbolo, tasa and date of that rate as a string, and in the same column of price show the equivalent registered of usd, the dual currency together.
4. Update the details dialog to include the dualcurrency strategy(../../Despacho/components/DespachoDetails/EditorLineasDialog.tsx) add the prices and total to the schema, types and so.
5. All prices set manually are usd but at the time selecting a rate, you will calculate the ves convertion for subtotal and total and update submit form




