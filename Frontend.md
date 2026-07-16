
---

## 📦 Módulo de Órdenes y Despachos (Tráfico)

### 1. Vista de Pedidos (`/despachos`)

* **Diseño:** Estructura de pestañas fijas arriba (`Tabs`) para segmentar los estados principales de forma instantánea.
* **Filtros Globales:** Buscador dinámico por cliente, selector para filtrar por chofer encargado y rango de fechas.
* **Tabla de Datos:**
* **Componentes Visuales:** Badges de colores de alta visibilidad para identificar el estado de un vistazo.
* `PREPARACION`: Gris / Azul claro.
* `EN_RUTA`: Naranja (Alerta: el camión está en la calle).
* `LIQUIDADA`: Verde (Operación cerrada con éxito).


* **Acciones:** Botón de "Ver Detalle" que enruta usando TanStack Router a `/despachos/$ordenId`.


* **Botón Prominente:** "Nueva Orden" que redirige a la ruta de creación.

### 2. Pantalla de Creación (`/despachos/crear`)

* **Formulario de Cabecera:** Selectores con búsqueda integrada (*Comboboxes* optimizados en caché) para **Cliente**, **Chofer**, **Almacén de Tránsito** y un *DatePicker* para la **Fecha de Salida**.
* **Sección de Detalles (Opcional en Creación):** * Un panel inferior donde se pueden buscar variantes por SKU y seleccionar el lote disponible.
* *Regla de Validación del Frontend:* El botón de "Cambiar a En Ruta" estará completamente deshabilitado en esta y cualquier vista si el array de detalles está vacío.



### 3. Panel Dinámico de Detalles (`/despachos/$ordenId`)

El comportamiento de esta vista muta por completo según el estado síncrono de la orden:

> 🔄 **Control de Flujo Dinámico en Pantalla**
> * **Modo PREPARACION:** Muestra un botón de "Editar Componentes". Al pulsarlo, abre un modal o despliega filas editables para añadir, eliminar o modificar las cantidades de los lotes asignados. Muestra un botón para "Despachar (Pasar a EN_RUTA)".
> * **Modo EN_RUTA:** La UI remueve todos los inputs, selectores y botones de borrado. Se convierte en una pantalla de **Solo Lectura** con un resumen limpio de la carga del camión. Habilita el botón de "Iniciar Liquidación".
> * **Modo TRANSICIÓN A LIQUIDADA:** La interfaz se transforma en el **Formulario de Liquidación de Retornos**.
> 
> 

#### 🛠️ Mecánica de la Tabla de Liquidación:

1. Muestra la fila con el producto original, lote y la `cantidad_enviada` (ej. 12 unidades).
2. Un campo numérico para `Cantidad Devuelta` (por defecto en 0).
3. **Si el usuario digita un número mayor a 0:** Se abre un sub-panel inmediatamente debajo de esa fila.
4. **Selector de Motivos Múltiples:** Un botón de "Añadir Motivo de Rechazo" que permite *dividir* las unidades devueltas.
* *Ejemplo:* Si se devuelven 5 unidades, el usuario puede agregar una fila de "3 unidades - Producto Roto" y otra fila de "2 unidades - Rechazado por Cliente". El sistema valida que la suma de los rechazos no supere la cantidad devuelta ni la enviada.



---

## 📋 Módulo de Inventario y Movimientos (Almacén)

### 1. Pantalla de Movimientos - Kardex (`/inventario/kardex`)

* **Enfoque:** Auditoría pura.
* **Diseño:** Tabla densa de datos de **Solo Lectura**. No existen botones de "Editar" ni "Eliminar".
* **Columnas Críticas:** Fecha/Hora exacta, Tipo (`ENTRADA`/`SALIDA`), SKU, Variante, Lote, Cantidad, Almacén Origen/Destino, Usuario que ejecutó el movimiento y la Referencia Inmutable (enlace directo al ID de la orden o pago).

### 2. Pantalla de Stock Actual (`/inventario/stock`)

* **Diseño:** Grid o Tabla de saldos físicos en tiempo real.
* **Uso del SKU:** El SKU se renderiza en una tipografía monoespaciada (ej. `font-mono`) y destacada para que el almacenista pueda contrastar la pantalla con las etiquetas físicas de las cajas o estantes de materia prima y producto terminado de forma rápida.
* **Estructura:** Agrupación por Almacén (`PRINCIPAL`, `TRANSITO`, `MERMA`) para saber exactamente qué mercancía está retenida en la calle o dañada en el almacén de averías.

---

### 💡 Consejo para TanStack Router con los Filtros

Para la vista de listado de pedidos, te recomiendo guardar el estado de los filtros (estatus, chofer, cliente) directamente en los **Search Params** de la URL usando las utilidades de TanStack Router. De este modo, si un usuario filtra las órdenes "En Ruta" del "Chofer Carlos", puede copiar el enlace del navegador, pasárselo a otro monitor del almacén, y este verá exactamente la misma vista filtrada.




💵 3. Módulo de Pagos y Finanzas (Cobranzas)

Tu planteamiento para este módulo es muy acertado. Dado tu modelo multimoneda, la interfaz debe guiar al usuario para evitar errores matemáticos.

    Pantalla Principal: Listado de documento_deuda (Facturas/Notas) con indicadores de colores (Rojo: Pendiente, Amarillo: Pagado Parcial, Verde: Pagado Total).

    Panel de Registro de Pago (Abonos): * Al seleccionar una factura, la cabecera del panel debe mostrar en grande el Saldo Pendiente Base (en USD).

        Múltiples Abonos: Un formulario iterativo. El usuario selecciona el Método (ej. Pago Móvil), la Divisa (VES), ingresa el monto_origen (ej. 5000) y el sistema, utilizando la tasa_aplicada de ese instante, calcula visualmente el equivalente en USD para que el cajero vea cuánto descontará de la deuda total.

        Un botón de "Añadir otro método" para completar el pago si el cliente paga una parte en efectivo y otra por transferencia.