### Create new combobox component to search for lotes in the backend

### Backend Instructions:

1. Define two endpoints on Pagos module and return a list of item on each, filter them based on a query search:
    - First - GET: 
        * Endpoint to return a list of 'ordenDespacho' model by ordenId where documentoDeuda is null, meaning, no document related to it and the 'estado' field in not LIQUIDADA.
        * The query search is numeroOrden
    - Second - GET: 
        * Endpoint to return a list of 'documentoDeuda' model by ordenId where documentoDeuda is not null, meaning, there's an order related to it and where estado is either PENDIENTE OR PAGADO_PARCIAL, and saldoPendienteBase is not 0.
        Pago Anticipado type - ordenDespacho
            - numeroOrden, estado, clienteNombre, totalOriginal
        * The query seach should be documentoDeuda id or ordenDespacho numeroOrden
        Pago Factura type  - documentoDeuda :
            - Id, numeroOrden (from OrdenId), clienteNombre, saldoPendienteBase 
2. Query the database to find items that match the queries from the request, 
3. Define ODTs to validate incomming data
4. Handle errors 
5. Create types if needed

### Frontend Instructions:

1. Modify the "/frontend/logistics/src/components/shared/combobox.tsx" component as a controlled React component that provides an interactive, searchable dropdown (combobox) for selecting orders or invoices for pagos form
2. This component will be use for searching data for ordenDespacho and documentoDeuda for pagos form.
3. Make this component usable for Pagos feature, in a dynamic way where the component will handle two types of data on the list, ordenDespacho Related and documentoDeuda related
4.  For the list of items that show in the results for the query will use the following types:
    Pago Anticipado type - ordenDespacho
    - numeroOrden, estado, clienteNombre, totalOriginal
    Pago Factura type  - documentoDeuda :
    - Id, numeroOrden (from OrdenId), clienteNombre, saldoPendienteBase 

5. Run the Request data based on users input
4. Cache the data using tanstack query
5. Add debounce to the search, and minimum of 3 character to enable request
7. Use the useDebounce hook at the src level of the project
8. Maintain a local searchTerm state linked to a text input. It applies a 250ms debounce (useDebounce hook) to this search term to prevent excessive API calls while the user is typing.
9. Create the component at /home/davidprz/projects/Logistics/frontend/logistics/src/features/Pagos/components