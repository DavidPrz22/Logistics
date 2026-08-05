### Implementa un modulo de facturacion para el sistema

# FRONTEND:

1. # Maneja la facturacion de ordenes

   REQUERIMIENTOS DEL FRONTEND

   RUTA 'Home' facturacion/:
   - Muestra una lista en forma de tabla con los datos mas relevantes del documentoDeuda
   - Agrega filtro para buscar por nombre, estado, tipoDocumento, un componente de fecha para filtrar por fechaEmision.
   - Agrega paginacion para 50 items a la vez

   Ruta 'id' factuacion/id:

   - Genera un panel de detalles con informacion de la factura
   - Incluye una lista de pagos realizados que se vinculen al documentoDeuda
   - En la lista de transaccionPago, haz que al dar click en la id lleve a pagos/id ruta
   - Incluye numeroOrden de la ordenDespacho con un link que lleve a despachos/id
