# Especificaciones Técnicas: Gestión de Tasas de Cambio (Home y Módulo de Pagos)

## 1. Visión General y Objetivo

El objetivo de este componente es gestionar las tasas de cambio de divisas utilizadas en la aplicación para transacciones, liquidaciones y cobranzas (ej. USD/VES, EUR/VES). Permite visualizar la tasa del día, consultar historial por fecha, sobreescribir manualmente la tasa comercial/vigente manteniendo la trazabilidad de la tasa original u oficial, y sincronizar/actualizar masivamente las tasas desde el dashboard de Pagos.

---

## 2. Requerimientos Funcionales

### 2.1. Acceso en Home Principal
- **Botón Tasa del Día:** En la barra superior o cabecera del Home (`index/home`), se muestra un botón destacado que indica la tasa activa actual. Al hacer clic, despliega el **Modal de Tasas de Cambio**.
- **Filtro por Fecha:** Dentro del modal, un selector (`DatePicker` / `<input type="date">`) permite consultar el registro de tasas de cambio aplicables a una fecha específica.
- **Tabla Informativa:** Visualiza las divisas configuradas, su tasa original, tasa vigente (sobreescrita o directa), origen y última actualización.
- **Edición Manual ("Modificar"):**
  - Al presionar "Modificar", los campos de la tabla se desbloquean y se convierten en inputs editables.
  - El usuario puede ingresar un nuevo valor de tasa.
  - La base de datos conserva la **tasa original** (ej. tasa oficial BCV) y almacena el valor modificado en un campo específico (`tasaModificada` / `tasaVigente`).
- **Guardado ("Actualizar"):**
  - Un botón "Actualizar" / "Guardar Cambios" valida que los valores sean numéricos y mayores a cero, envía los cambios al backend y bloquea nuevamente los inputs mostrando los datos actualizados.

### 2.2. Acceso en Home de Pagos
- **Botón "Actualizar Tasa":** Ubicado en el dashboard/home del módulo de Pagos.
- Al hacer clic, dispara la sincronización/recarga de datos de tasa de cambio en la base de datos (obteniendo el valor oficial o recalculando la vigencia diaria).

---

## 3. Arquitectura y Modelo de Datos (Prisma Schema)

### 3.1. Ajustes en `tasaCambio` (`prisma/schema/pago.prisma`)

```prisma
model tasaCambio {
  id               Int       @id @default(autoincrement())
  divisaOrigenId   Int       
  divisaDestinoId  Int       
  tasaOriginal     Decimal   @db.Decimal(18, 4) // Tasa oficial / origen original
  tasaModificada   Decimal?  @db.Decimal(18, 4) // Tasa sobreescrita por el usuario (si aplica)
  tasa             Decimal   @db.Decimal(18, 4) // Tasa efectiva a aplicar (calculada: tasaModificada ?? tasaOriginal)
  esModificada     Boolean   @default(false)    // Flag de sobreescritura manual
  origenTasa       String?                      // Ej: "BCV", "MANUAL", "API_EXTERNA"
  fechaVigencia    DateTime  @default(now()) 
  creadoEn         DateTime  @default(now())
  actualizadoEn    DateTime  @updatedAt
  usuarioId        Int?                         // Usuario que realizó la última modificación manual

  divisaOrigen   divisa   @relation("DivisaOrigen", fields: [divisaOrigenId], references: [id])
  divisaDestino  divisa   @relation("DivisaDestino", fields: [divisaDestinoId], references: [id])
  usuario        usuario? @relation(fields: [usuarioId], references: [id])

  @@index([fechaVigencia])
  @@index([divisaOrigenId, divisaDestinoId])
}
```

---

## 4. Diseño de API REST (NestJS - `pagos.controller.ts`)

| Método | Endpoint | Descripción | Body / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/pagos/tasas-cambio/hoy` | Obtiene la tasa de cambio activa para la fecha actual | `?divisaOrigenId=&divisaDestinoId=` |
| `GET` | `/pagos/tasas-cambio` | Obtiene el historial de tasas filtrado por fecha | `?fecha=YYYY-MM-DD` |
| `PATCH` | `/pagos/tasas-cambio/:id/override` | Modifica/sobreescribe manualmente una tasa manteniendo la original | `{ tasaModificada: number, usuarioId: number }` |
| `POST` | `/pagos/tasas-cambio/actualizar-oficial` | Sincroniza/actualiza la tasa de cambio oficial en BD (Botón Pagos) | `{ origen?: string }` |

---

## 5. Especificaciones de UI / UX

### 5.1. Modal de Tasa de Cambio (Home)
- **Header:** Título "Tasa de Cambio del Día", Selector de Fecha (`date`), Botón de Cerrar (`X`).
- **Body - Tabla de Tasas:**
  - **Columnas:** `Divisa Origen` | `Divisa Destino` | `Tasa Oficial` | `Tasa Vigente` | `Origen` | `Última Modificación`
  - **Modo Lectura:** Los valores de `Tasa Vigente` se muestran formateados (ej. `BS. 36.50`). Badge indicador si fue sobreescrita manualmente ("Modificado").
  - **Modo Edición ("Modificar"):**
    - Los valores de `Tasa Vigente` se convierten en `<input type="number" step="0.0001" min="0.0001">`.
    - Botones de acción alternan a: `[Cancelar]` y `[Guardar Cambios]`.
- **Footer:** Botón `[Cerrar]` / `[Actualizar Base de Datos]`.

### 5.2. Botón "Actualizar Tasa" (Pagos Home)
- Botón secundario con icono de refresco 🔄.
- Al ejecutarse:
  1. Muestra estado *Loading* / Deshabilitado.
  2. Llama a `POST /pagos/tasas-cambio/actualizar-oficial`.
  3. Muestra una notificación Toast de éxito ("Tasas de cambio actualizadas correctamente") o error.

---

## 6. Reglas de Negocio y Seguridad

1. **Preservación de Tasa Original:** En ningún caso una modificación manual debe borrar el valor de `tasaOriginal`. La audibilidad e integridad financiera dependen de conservar la tasa oficial de la fecha.
2. **Prioridad de Tasa en Operaciones:** Toda transacción (`transaccionPago`) debe tomar el valor de `tasa` (que devuelve `tasaModificada ?? tasaOriginal`).
3. **Validación:**
   - La tasa no puede ser $\le 0$.
   - Precisión decimal fijada a 4 decimales.
4. **Control de Permisos:** La acción de sobreescribir la tasa manualmente ("Modificar") debe estar restringida a roles con permisos administrativos (`TESORERIA`, `ADMIN`).

---

## 7. Plan de Verificación y Pruebas

- **Pruebas Unitarias (`pagos.service.spec.ts`):**
  - Verificar que al crear/actualizar una tasa con override se establezca `tasaModificada` y `esModificada = true`.
  - Verificar que las consultas por fecha retornen los registros correspondientes.
  - Validar rechazo de tasas $\le 0$.
- **Pruebas de Integración / E2E:**
  - Probar flujo completo: Abrir modal -> Filtrar por fecha -> Presionar Modificar -> Cambiar valor -> Guardar -> Confirmar que el pago posterior utiliza la nueva tasa.