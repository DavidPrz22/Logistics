### Update the index panel of the payments module

# FRONTEND

1. Refactor the index component for the index route of 'Pagos'
2. Create schemas and infer data types for data that comes from the backend
3. Model the component (frontend/logistics/src/routes/pagos/index.tsx) based on the type 'TransaccionTablaType' in frontend/logistics/src/features/Pagos/types/type.ts
4. Remove placeholder data, function and variables that have no reference and replace them with incomming data
5. Create queryoptions, useQueries and requests with error handling withing the feature for this data

# BACKEND 

1. Create an endpoint with Pagos module to bring a list of records from 'transaccionPago' model with the form of 'TransaccionTablaType' define types and odts 