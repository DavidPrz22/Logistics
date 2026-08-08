# Especificaciones Técnicas e Instrucciones de Implementación: Módulo de Pagos

## 1. Visión General y Objetivo

El **Módulo de Pagos** gestiona todas las transacciones financieras del sistema de logística (ingresos por anticipos de pedidos y cobros de facturas). Permite el registro, seguimiento, filtrado y auditoría de pagos en distintas divisas, garantizando el cruce automático de anticipos con facturas emitidas tras la liquidación de despacho, y controlando la liquidación total de saldos de deuda.

---

## 2. Modelo de Datos y Entidades Relacionadas (`prisma/schema/pago.prisma`)

El módulo interactúa principalmente con los siguientes modelos y enums de Prisma:

- **`transaccionPago`**: Registro individual de cada pago realizado.
  - Campos clave: `ordenId`, `documentoId`, `tipoDePago` (`ANTICIPO`, `COBRO_FACTURA`, `SALDO_A_FAVOR`), `metodoPagoId`, `divisaPagoId`, `montoOrigen`, `tasaAplicada`, `montoEquivalenteBase`, `numeroReferencia`, `estado` (`APROBADO`, `ANULADO`, `RECHAZADO`), `cuentaDestinoId`, `usuarioId`, `fechaPago`.
- **`documentoDeuda`**: Facturas y notas de crédito generadas tras la liquidación.
  - Campos clave: `montoTotalBase`, `saldoPendienteBase`, `estado` (`PENDIENTE`, `PAGADO_PARCIAL`, `PAGADO_TOTAL`, `ANULADO`), `tipoDocumento` (`FACTURA`, `NOTA_CREDITO`), `ordenId`, `clienteId`.
- **`ordenDespacho`**: Orden de origen asociada a un anticipo antes de facturar.
- **`metodoPago`**, **`divisa`**, **`cuentaDestino`**: Catalogos de apoyo para transacciones.

---

## 2.2🔄 Secuencia del Flujo de Pago

### 1. Selección e Inicialización del Documento

- **Selección del Origen:** El usuario selecciona el documento u orden de venta a procesar.
- **Carga de Datos Iniciales:**
  - Visualización e inicialización en la interfaz del `montoTotalBase` (en divisa base, ej. VES).
  - Visualización del `saldoPendienteBase` (en divisa base).
  - Despliegue del estado actual del documento u orden.

### 2. Configuración de Parámetros de Pago

- **Monto por Defecto:** El campo de entrada para la cantidad del pago toma automáticamente como valor inicial por defecto el `saldoPendienteBase`.
- **Selectores de Configuración:**
  - **Método de pago:** Componente _select_ con las opciones disponibles (ej. Transferencia, Efectivo, Punto de venta, Pago móvil).
  - **Divisa de pago:** Componente _select_ para la moneda con la que cancela el cliente (ej. USD, VES).
  - **Cuenta destino:** Componente _select_ para elegir la caja o cuenta bancaria receptora.
- **Fecha de Transacción:** Campo de fecha integrado con un componente `datepicker`.

### 3. Evaluación Dinámica y Conversión en Tiempo Real

- **Visibilidad Dinámica de Referencia:**
  - El campo `numeroDeReferencia` se evalúa dinámicamente según el método de pago elegido:
    - Si el método lo requiere (ej. transferencia, pago móvil), el campo se habilita/muestra.
    - Si el método no lo necesita (ej. efectivo), el campo desaparece dinámicamente de la interfaz.
- **Cálculo y Conversión en Tiempo Real:**
  - Al ingresar o modificar la cantidad de pago, la divisa o la tasa de cambio seleccionada, el sistema muestra inmediatamente la conversión basada en la tasa utilizada.
  - **Desglose en la interfaz:**
    - Moneda base: **VES**
    - Moneda de pago: **USD**
    - Cantidad de pago en USD: **10 USD**
    - Tasa aplicada: **123 VES/USD**
    - Cantidad equivalente en moneda base: **1,230 VES**
    - Visualización del impacto: Monto convertido en moneda base restado al total/saldo pendiente.

### 4. Registro y Consolidación del Pago

- **Confirmación:** El usuario confirma y registra la transacción con todos los parámetros consolidados:
  - Método de pago.
  - Divisa utilizada.
  - Tasa de cambio aplicada.
  - Monto cancelado (en divisa de pago y su equivalente base).
  - Cuenta destino.
  - Fecha seleccionada.
  - Número de referencia (si aplica).
- **Actualización de Saldos:** El sistema recalcula el saldo restante del documento y actualiza su estado.

### 3.1. Vista Principal: `/pagos` (Historial y Búsqueda)

- **Tabla de Transacciones de Pago:**
  - Columnas: ID / Referencia, Fecha, Cliente / Orden / Factura, Tipo de Pago (`ANTICIPO` / `COBRO_FACTURA`), Método de Pago, Monto Origen (con Divisa), Monto Equip. Base, Estado (`APROBADO`, `ANULADO`), Acciones.
- **Filtros Avanzados:**
  - Búsqueda por texto (Nombre de cliente, número de referencia o ID de transacción).
  - Filtro por Estado (`APROBADO`, `ANULADO`, `RECHAZADO`).
  - Filtro por Tipo de Pago (`ANTICIPO`, `COBRO_FACTURA`, `SALDO_A_FAVOR`).
  - Filtro de Rango de Fechas con componente `DatePicker` (Desde / Hasta).
- **Paginación:**
  - Paginación del lado del servidor (hasta 50 registros por página por defecto).
- **Botón "Crear Pago" (Dropdown Split Button):**
  - Ubicado en el header superior de la vista.
  - Opciones desplegables:
    1. **Pago Anticipado** $\rightarrow$ Redirige a `/pagos/crear/anticipado`
    2. **Cobro de Factura** $\rightarrow$ Redirige a `/pagos/crear/factura`

---

### 3.2. Formulario de Pago Anticipado: `/pagos/crear/anticipado`

- **Objetivo:** Registrar un abono previo a la emisión de la factura fiscal para compras en proceso.
- **Componentes y Campos:**
  - **Selector de Orden (Combobox con búsqueda live):** Muestra órdenes en estado `PREPARACION` o `EN_RUTA`. Retorna información del cliente, monto estimado de la orden y anticipos ya registrados.
  - **Método de Pago:** Select (`EFECTIVO`, `TRANSFERENCIA`, `PAGO_MOVIL`, `ZELLE`, etc.).
  - **Divisa de Pago y Tasa de Cambio:** Selector de divisa (`USD`, `VES`, `EUR`) con precarga de la `tasaCambio` vigente
  - **Monto Origen:** Input numérico.
  - **Monto Equivalente Base (Calculado):** $montoOrigen \times tasaAplicada$.
  - **Número de Referencia:** Requerido si el método lo exige (`requiereReferencia = true`).
  - **Cuenta Destino:** Select de cuenta bancaria o caja receptora (`cuentaDestino`).
  - **Fecha de Pago:** Selector de fecha (por defecto fecha actual).
- **Validación con Schema Zod:** `CrearPagoAnticipadoSchema`.
- **Efecto Posterior al Registro:**
  - Guarda la transacción con `ordenId = ORD-XXX` y `documentoId = NULL`.
  - Muestra un indicador visual en la orden: `"Anticipo recibido: $XX.XX"`.

---

### 3.3. Formulario de Cobro de Factura: `/pagos/crear/factura`

- **Objetivo:** Registrar el cobro parcial o total de una factura (`documentoDeuda`) ya emitida.
- **Componentes y Campos:**
  - **Selector de Factura (Combobox con búsqueda live):** Muestra facturas (`tipoDocumento = FACTURA`) cuyos estados **no** sean `ANULADO` ni `PAGADO_TOTAL`.
  - Muestra el cliente, `montoTotalBase` y `saldoPendienteBase` actual de la factura.
  - **Método de Pago, Divisa, Tasa de Cambio, Cuenta Destino, Referencia y Fecha.**
  - **Monto a Abonar:** Input numérico validado para que no exceda el `saldoPendienteBase` (salvo que se autorice generar saldo a favor).
- **Validación con Schema Zod:** `CrearCobroFacturaSchema`.
- **Efecto Posterior al Registro:**
  - Guarda la transacción apuntando a `documentoId = FAC-XXX`.
  - Actualiza `saldoPendienteBase = saldoPendienteBase - montoEquivalenteBase`.
  - Actualiza el estado de `documentoDeuda`:
    - Si `saldoPendienteBase == 0` $\rightarrow$ `PAGADO_TOTAL`.
    - Si `saldoPendienteBase > 0` $\rightarrow$ `PAGADO_PARCIAL`.

---

### 3.4. Vista de Detalle: `/pagos/[id]`

- Visualización completa de los datos del pago.
- Badge con estado de la transacción (`APROBADO`, `ANULADO`).
- Tarjetas informativas con los montos en moneda original y moneda base.
- Links interactivos directos a la **Orden de Despacho** o **Documento de Deuda (Factura)** vinculado.
- Auditoría: Nombre del usuario que registró el pago y timestamp exacto.
- Botón para anular pago (sujeto a roles de administración).

---

## 4. Flujo Operativo y Ciclo de Vida del Pago

```
[1. Pago Anticipado]               [2. Liquidación y Cruce]            [3. Cobro Restante]
  Pago 50$ ──> Orden           ──>   Emisión Factura (100$)       ──>    Pago 50$ ──> Factura
  (ordenId: 1, documentoId: null)     Cruce automático: -50$             (documentoId: FAC-001)
                                      Saldo pendiente: 50$               Saldo pendiente: 0$
                                      Estado: PAGADO_PARCIAL             Estado: PAGADO_TOTAL
```

1. **Paso 1: Anticipo Inicial (Orden en PREPARACION / EN_RUTA)**
   - El cliente abona un porcentaje (ej. 50$).
   - Se crea `transaccionPago` con `ordenId = ORD-001` y `tipoDePago = ANTICIPO`.
   - La orden refleja el monto anticipado.

2. **Paso 2: Liquidación de Ruta y Emisión de Factura**
   - Al liquidar la ruta, nace `documentoDeuda` (`tipoDocumento = FACTURA`, `montoTotalBase = 100$`).
   - El backend detecta automáticamente las `transaccionPago` de tipo `ANTICIPO` vinculadas a la `ordenId`.
   - Asocia esos anticipos al nuevo `documentoDeuda` y descuenta sus montos del `saldoPendienteBase`.
   - Estado de la factura pasa a `PAGADO_PARCIAL` (o `PAGADO_TOTAL` si cubrió el 100%).

3. **Paso 3: Pago Restante (Post-Entrega / Crédito)**
   - El cliente abona el saldo restante (50$).
   - Se registra el pago desde `/pagos/crear/factura` o desde la pantalla de la Factura (`[Registrar Cobro]`).
   - La transacción se vincula directamente a `documentoId = FAC-001`.
   - La factura cambia a `PAGADO_TOTAL`.

---

## 5. Diseño de API REST (NestJS - `PagosController` & `PagosService`)

| Método | Endpoint                     | Descripción                             | Query / Body Params                                                        |
| :----- | :--------------------------- | :-------------------------------------- | :------------------------------------------------------------------------- |
| `GET`  | `/pagos`                     | Lista paginada de transacciones         | Query: `page`, `limit`, `search`, `estado`, `tipoDePago`, `desde`, `hasta` |
| `GET`  | `/pagos/:id`                 | Obtener detalle de una transacción      | Param: `id`                                                                |
| `POST` | `/pagos/anticipado`          | Registrar pago anticipado               | Body: `CrearPagoAnticipadoDto`                                             |
| `POST` | `/pagos/factura`             | Registrar cobro de factura              | Body: `CrearCobroFacturaDto`                                               |
| `POST` | `/pagos/:id/anular`          | Anular una transacción de pago          | Param: `id`, Body: `{ motivo: string }`                                    |
| `GET`  | `/pagos/ordenes-pendientes`  | Obtener órdenes elegibles para anticipo | Query: `search`                                                            |
| `GET`  | `/pagos/facturas-pendientes` | Obtener facturas elegibles para cobro   | Query: `search`                                                            |

---

## 6. Esquemas de Validación (Zod DTOs)

### 6.1. Schema Pago Anticipado (`CrearPagoAnticipadoSchema`)

```typescript
import { z } from 'zod';

export const CrearPagoAnticipadoSchema = z.object({
  ordenId: z.number().int({ message: 'La orden es requerida' }),
  metodoPagoId: z.number().int({ message: 'El método de pago es requerido' }),
  divisaPagoId: z.number().int({ message: 'La divisa es requerida' }),
  montoOrigen: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  tasaAplicada: z.number().positive({ message: 'La tasa debe ser mayor a 0' }),
  numeroReferencia: z.string().optional(),
  cuentaDestinoId: z.number().int().optional(),
  fechaPago: z.coerce.date().default(() => new Date()),
});
```

### 6.2. Schema Cobro de Factura (`CrearCobroFacturaSchema`)

```typescript
import { z } from 'zod';

export const CrearCobroFacturaSchema = z.object({
  documentoId: z
    .number()
    .int({ message: 'El documento de deuda es requerido' }),
  metodoPagoId: z.number().int({ message: 'El método de pago es requerido' }),
  divisaPagoId: z.number().int({ message: 'La divisa es requerida' }),
  montoOrigen: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  tasaAplicada: z.number().positive({ message: 'La tasa debe ser mayor a 0' }),
  numeroReferencia: z.string().optional(),
  cuentaDestinoId: z.number().int().optional(),
  fechaPago: z.coerce.date().default(() => new Date()),
});
```

---

## 7. Casos Borde y Reglas de Negocio Adicionales

1. **Validación de Sobrepago:**
   - Si el `montoEquivalenteBase` ingresado para una factura excede el `saldoPendienteBase`, el sistema debe advertir al usuario y/o registrar la diferencia como `SALDO_A_FAVOR` para el cliente.
2. **Anulación de Pagos:**
   - Al anular una `transaccionPago` (`estado = ANULADO`), si estaba vinculada a un `documentoDeuda`, el monto equivalente se debe reincorporar al `saldoPendienteBase` y el estado de la factura se recalcula (`PAGADO_PARCIAL` o `PENDIENTE`).
3. **Idempotencia y Referencias Duplicadas:**
   - Validar que no se registren dos pagos con el mismo `numeroReferencia` para el mismo `metodoPagoId` en transacciones activas (`APROBADO`).
