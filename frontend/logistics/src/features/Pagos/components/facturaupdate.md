

Update factura feature

backend: 
1. update the creation of factura at the liquidation time and add the dual currency data for ves using the rate value selected backend/api/src/despacho/despacho.service.ts // updateOrdenDespachoLiquidar
2. Update odts, types, endpoint to return dualcurrency data in factura module

frontend:

1. Update the factura details panel to show dual currency data for usd and ves with data from endpoints, update types and schema as needed