### DEFINE ENDPOINTS AND REQUESTS FOR FACTURAS


# ON FACTURAS FEATURE
    # FRONTEND

    DEFINE SCHEMAS FOR frontend\logistics\src\features\Facturacion\types\types.ts
        - DocumentoDeudaListado
        - DocumentoDeudaDetalle
        - PagosVinculadosDocumento

    # ENDPOINTS FOR BACKEND

    ### RUTA LIQUIDADA
    ON FACTURAS APP 
    - GET /facturas/ 
        Return the list of facturas following the schemas DocumentoDeudaListado
    - GET /facturas/:id/
        Return the detail of a factura following the schemas DocumentoDeudaDetalle

    CREATE ODTS, Types if need and use prisma.

# ON APP SRC

    CREATE REQUEST AND LIST FOR:
        ({LISTA NAME TO CREATE - SCHEMA IN BACKEND})
        - ESTADOS FACTURAS - estadoDocumentoDeuda
        - ESTADOS TRANSACCIONES PAGO - estadoTransaccionPago
        - TIPOS DOCUMENTO - tipoDocumentoDeuda
        - TIPOS PAGO - TipoDePago
        - TIPOS OPERACION - tipoOperacionPago
        - CUENTA DESTINO - cuentaDestino

    CREATE ENDPOINTS IN CORE FOR THIS /backend/api/src/core/
    DEFINE SCHEMAS, REQUEST AND FOLLOW HOW IT IS IMPLEMENT IT FOR DATA IN THESE FILE
    - frontend/logistics/src/api/api.ts
    - frontend/logistics/src/types/zodType.ts
    - frontend/logistics/src/hooks/queries.ts