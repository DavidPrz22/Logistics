Modulo de pagos

Requerimientos:

    * Mostrar lista de pagos realizados en una tabla (historia).
    * Filtros para busqueda de pagos por nombre, estado y fecha

    * Crear un formulario para registrar pagos con una ruta especifica
    * Crear una ruta para ver detalles de pagos por id
    * Permitir crear pagos, ya sean anticipados o normales
    * Los pagos anticipados solo se puede registrar a ordenes cuyo estado es PREPARACION o EN_RUTA NO A FACTURAS
    * Los pagos normales se registran a factuas
    * Todo registro de pago debe exigir obligatoriamente: Cliente, Monto, Fecha, Método de Pago
    * Al registrar un pago, verificar:
        - si existe un pago anticipado
        - si el monto total abonado coincide con el monto de la factura y cambiar el estado a completo
    * Al liquidarse una orden, el sistema debe cruzar (aplicar) automáticamente los anticipos guardados en esa orden contra la nueva factura generada.
    [1. Anticipo 50%]          [2. Liquidación]               [3. Pago Restante 50%]
    Pago 50$ ──> Orden   ──>   Factura Nace (100$)       ──>    Pago 50$ ──> Factura
                             (-50$ Anticipo cruzado)
                             Saldo pendiente: 50$             Saldo pendiente: 0$ (PAGADO)


    Paso 1: Pago del 50% Inicial (Orden en PREPARACION)

    Acción: El cliente transfiere 50 $ para procesar el pedido.

    Sistema: Como la factura no se ha emitido, el pago se guarda en transaccion_pago con la relación orden_id = ORD-001 (y documento_deuda_id = NULL).

    Estado de la Orden: PREPARACION (con marcador visual: "Anticipo recibido: 50 $").

    Paso 2: Liquidación de la Ruta y Generación de Factura

    Acción: El camión entrega la mercancía y la orden se marca como LIQUIDADA.

    Sistema:

        Nace el registro en documento_deuda (Factura fiscal por 100 $).

        El sistema detecta el anticipo de 50 $ de la orden y lo "cruza" o aplica a la nueva factura.

        La factura pasa automáticamente al estado PAGADO_PARCIAL con un saldo pendiente de 50 $.

    Paso 3: Pago del 50% Restante (Crédito / Post-Entrega)

    Acción: El cliente paga los 50 $ restantes a los 5 días de haber recibido la mercancía.

    ¿Dónde se registra?

        En la UI: Se puede hacer desde el Módulo de Tesorería/Pagos (buscando al cliente o la factura) o mediante un botón directo en la pantalla de la Factura: [Registrar Cobro].

        En la Base de Datos: Este segundo pago se guarda en transaccion_pago apuntando directamente a documento_deuda_id = FAC-001.

    Resultado: La factura pasa a estado PAGADO_TOTAL.

PARA MI:

### DESCONTAR MONTOS TOTAL DE RECHAZO A FACTURAS CON PAGOS ANTICIPADOS SI LO REQUIERE

/////////////////////
### Modulo de pagos

## Requerimientos:
# Rutas Fronted:

* pagos/
    * Mostrar lista de pagos realizados en una tabla (historia).
    * Filtros para busqueda de pagos por nombre, estado, tipo de pago y fecha (agrega un componente de datepicker para filter fecha)
    * Agrega paginacion de hasta 50 registros de pagos por pagina
    * Agrega un boton para crear un pago. El boton debe ser de estilo dropdown con dos opciones: 
        1. Pago Anticipado, 
        2. Cobro de Factura
    * Cada opcion de te lleva a una ruta de creacion de factura distinta


* pagos/crear/anticipado
    * Agrega campos para registar un pago anticipado
    * Crea un schema para validar pagos anticipados
    * Agrega un componente de tipo combobox con un input de search que muestre una lista de ordenes de estado PREPARACION o EN_RUTA, los cuales deben retornar informacion de pago de la orden que se ultiza para realizar la transaccion

    * Al registrar un pago, verificar:
        - si existe un pago anticipado
        - si el monto total abonado coincide con el monto de la factura y  actualizar el estado



* pagos/crear/factura
    * Agrega campos para registar un pago de COBRO_FACTURA
    * Crea un schema para validar pagos de cobro de factura
    * Agrega un componente de tipo combobox con un input de search que muestre una lista de facturas (documentoDeuda) de tipo FACTURA y estado no sea ANULADO o PAGADO_TOTAL los cuales deben retornar informacion de pago de la factura que se ultiza para realizar la transaccion

    

* pagos/id

    * Crear una ruta para ver detalles de pagos por id con toda la informacion relevante
    * Agregar links que te lleven a la orden o documento de deuda vinculado al pago


FLUJO DEL SISTEMA DE PAGO
    [1. Anticipo 50%]          [2. Liquidación]               [3. Pago Restante 50%]
    Pago 50$ ──> Orden   ──>   Factura Nace (100$)       ──>    Pago 50$ ──> Factura
                             (-50$ Anticipo cruzado)
                             Saldo pendiente: 50$             Saldo pendiente: 0$ (PAGADO)


    Paso 1: Pago del 50% Inicial (Orden en PREPARACION)

    Acción: El cliente transfiere 50 $ para procesar el pedido.

    Sistema: Como la factura no se ha emitido, el pago se guarda en transaccion_pago con la relación orden_id = ORD-001 (y documento_deuda_id = NULL).

    Estado de la Orden: PREPARACION (con marcador visual: "Anticipo recibido: 50 $").

    Paso 2: Liquidación de la Ruta y Generación de Factura

    Acción: El camión entrega la mercancía y la orden se marca como LIQUIDADA.

    Sistema:

        Nace el registro en documento_deuda (Factura fiscal por 100 $).

        El sistema detecta el anticipo de 50 $ de la orden y lo "cruza" o aplica a la nueva factura.

        La factura pasa automáticamente al estado PAGADO_PARCIAL con un saldo pendiente de 50 $.

    Paso 3: Pago del 50% Restante (Crédito / Post-Entrega)

    Acción: El cliente paga los 50 $ restantes a los 5 días de haber recibido la mercancía.

    ¿Dónde se registra?

        En la UI: Se puede hacer desde el Módulo de Tesorería/Pagos (buscando al cliente o la factura) o mediante un botón directo en la pantalla de la Factura: [Registrar Cobro].

        En la Base de Datos: Este segundo pago se guarda en transaccion_pago apuntando directamente a documento_deuda_id = FAC-001.

    Resultado: La factura pasa a estado PAGADO_TOTAL.

