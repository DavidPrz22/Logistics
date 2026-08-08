### ORGANIZE DATA COMING FROM THE BACKEND TO BE USED IN FRONTEND COMPONENTS

1. Use the endpoints and requests available in [facturacion](../api/api.ts) and create tanstack usequery to cache and use this data for invoices lists and details (by id)

2. Update the data of the following components, make the props and data models that these used to corresponds to two types as follows: 
    Component 1: /frontend/logistics/src/routes/facturacion/index.tsx - TYPE: DocumentoDeudaListadoType,
    Component 2: frontend/logistics/src/routes/facturacion/$documentoId/index.tsx - TYPE: DocumentoDeudaDetalleType,
    Types source: frontend/logistics/src/features/Facturacion/schemas/schemas.ts

Remove the use of methods or data currently as placeholder and that do not exists. Change these for the data that comes from the request for the according type. Remove fields or columns that appear in the components that do not show any relation with the data types defined for the component.

3. Use the queries from frontend/logistics/src/hooks/queries/queries.ts to populate data for select options in the components 