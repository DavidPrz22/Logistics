Modulo de facturacion

# Maneja la facturacion de ordenes

    REQUERIMIENTOS DEL FRONTEND

    REQUERIMIENTOS DEL BACKEND
    * Generar facturas automaticamente al momento de liquidar ordenes
    * Tener un modulo de facturas donde se muestra una lista de facturas y sus datos en base a la tabla de documentoDeuda
    * Filtros para busqueda por nombre, estado y fechaEmision.
    * Permitir crear facturas y asociarlas a ordenes que no tengan facturas, y que no esten liquidadas
    * Se puede crea una factura para VENTA_MOSTRADOR. Al crear ordenes se puede vincular ordenes que sean ese tipo:

'VENTA_MOSTRADOR'. * Usa una ruta para crear facturas y otra ruta para ver detalles * En los detalles del documento de deuda, se muestra una tabla como lista de todos los pagos asociados

En Home * En la ruta index/home de la app, muestra un boton para abrir un modal, que al abrirse se muestra informacion de tasa de cambio del dia. Se muestra un select para mostrar registros de tasa por fecha. Esta lista, en una tabla que muestra la info, con un botton "Modificar" que desbloquea la tabla para modificar la seccion de inputs donde cambia el valor de las divisas, sobreescribiviendo la tasa, sin perder la original con un campo en la base de datos. Luego otro boton "actualizar" que actualiza y guarda los cambios a la base de datos. * En home de pagos, debe existir un boton que se llame actualizar tasa y actualize los datos de tasas de cambio en la base de datos.

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

### GENERAR FACTURA AL LIQUIDAR

### VERIFICAR QUE AL LIQUIDAR EXISTAN PAGOS ANTICIPADOS

### MOSTRAR PAGOS ANTICIPADOS EN LOS DETALLES DE LA ORDEN

### AGREGAR TIPO DE ORDEN A LA FORMA DE DESPACHO

### DESCONTAR MONTOS TOTAL DE RECHAZO A FACTURAS CON PAGOS ANTICIPADOS SI LO REQUIERE
