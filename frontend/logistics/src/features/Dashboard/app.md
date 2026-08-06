### Populate the tasas de cambio component with backend data, remove the placeholder data


1. Fronted specifications:

    * Update the component ```frontend/logistics/src/features/Dashboard/components/GenerarTasasButton.tsx```
    * Remove the placeholder data with data from the backend
    * Create request to get a list of records for registroTasas and display it with to the select
    * Once a record shown in the select is clicked, then fetch all data from that record, 'tasaCambio' related to it
    * Create request for divisas, and display its items on the 'Filtrar por moneda' component, once a user select an item, then it filter the currency selected from the 'tasacambio' records.
    * Create types for divisas records, registroTasa and tasacambio
    * Create queryoptions to cache them with tanstack
    * Show in the table the 'tasaCambio' records from 'registroTasas' selected


2. Backend specifications
    * Create endpoints seperate to get divisas data, registroTasas
    * Define their types
    * Create an endpoint to get all records 'tasaCambio' from 'registroTasasId' as path parameter




### Create a modify Tasas de cambio registro feature

FRONTEND:

    * Create a form with react hook form to update 'tasaCambio' records shown in table
    * Create a schema to validate data and infer types
    * Create and use a mutation for it, add the request to the api folder
    * Invalidate the queries for the current selected 'registroTasas' record
    * When The user updates the value of the rate 'tasa', in the schema, add 'tasaModificada' field


BACKEND:
    * CREATE AN ENDPOINT TO UPDATE 'tasaCambio' records by a 'registroTasas' id
    * You will update the record by updating the tasaModificada value
    * Create odts, types, and get the id in a pathparameter
    * 

