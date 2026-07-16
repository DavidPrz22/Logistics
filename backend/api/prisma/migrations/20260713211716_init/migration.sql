-- CreateTable
CREATE TABLE "almacen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "chofer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "licenciaConducir" TEXT NOT NULL CHECK(length("licenciaConducir") <= 50),
    "telefono" TEXT CHECK(length("telefono") <= 20)
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "telefono" TEXT CHECK(length("telefono") <= 20),
    "direccion" TEXT CHECK(length("direccion") <= 200)
);

-- CreateTable
CREATE TABLE "lote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "varianteId" INTEGER NOT NULL,
    "numeroLote" TEXT NOT NULL CHECK(length("numeroLote") <= 50),
    "fechaVencimiento" DATETIME NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "fechaIngreso" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lote_varianteId_fkey" FOREIGN KEY ("varianteId") REFERENCES "varianteProducto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimientoInventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loteId" INTEGER NOT NULL,
    "almacenId" INTEGER NOT NULL,
    "detalleOrdenId" INTEGER,
    "detalleRechazoId" INTEGER,
    "tipoMovimiento" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaMovimiento" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT NOT NULL CHECK(length("referencia") <= 100),
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "movimientoInventario_detalleOrdenId_fkey" FOREIGN KEY ("detalleOrdenId") REFERENCES "detalleOrden" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientoInventario_detalleRechazoId_fkey" FOREIGN KEY ("detalleRechazoId") REFERENCES "detalleRechazoOrden" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientoInventario_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientoInventario_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimientoInventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordenDespacho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroOrden" TEXT NOT NULL CHECK(length("numeroOrden") <= 20),
    "clienteId" INTEGER NOT NULL,
    "choferId" INTEGER,
    "almacenTransitoId" INTEGER NOT NULL,
    "fechaSalida" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT DEFAULT 'PREPARACION',
    "totalFacturadoOriginal" DECIMAL DEFAULT 0.00,
    "saldoNetoCobrar" DECIMAL DEFAULT 0.00,
    "totalRechazado" DECIMAL DEFAULT 0.00,
    CONSTRAINT "ordenDespacho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "chofer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_almacenTransitoId_fkey" FOREIGN KEY ("almacenTransitoId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "detalleOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" INTEGER NOT NULL,
    "loteId" INTEGER NOT NULL,
    "cantidadEnviada" INTEGER NOT NULL,
    "precioUnitario" DECIMAL NOT NULL,
    CONSTRAINT "detalleOrden_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenDespacho" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "detalleOrden_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "detalleRechazoOrden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "detalleOrdenId" INTEGER NOT NULL,
    "cantidadRechazada" INTEGER NOT NULL,
    "motivoRechazoId" INTEGER NOT NULL,
    "almacenReingresoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaRechazo" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    CONSTRAINT "detalleRechazoOrden_detalleOrdenId_fkey" FOREIGN KEY ("detalleOrdenId") REFERENCES "detalleOrden" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "detalleRechazoOrden_motivoRechazoId_fkey" FOREIGN KEY ("motivoRechazoId") REFERENCES "motivoRechazo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "detalleRechazoOrden_almacenReingresoId_fkey" FOREIGN KEY ("almacenReingresoId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "detalleRechazoOrden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "motivoRechazo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL CHECK(length("codigo") <= 10),
    "descripcion" TEXT NOT NULL CHECK(length("descripcion") <= 100),
    "requiereMerma" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "divisa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL CHECK(length("codigo") <= 3),
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 50),
    "esMonedaBase" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "tasaCambio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "divisaOrigenId" INTEGER NOT NULL,
    "divisaDestinoId" INTEGER NOT NULL,
    "tasa" DECIMAL NOT NULL,
    "origenTasa" TEXT CHECK(length("origenTasa") <= 50),
    "fechaVigencia" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasaCambio_divisaOrigenId_fkey" FOREIGN KEY ("divisaOrigenId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tasaCambio_divisaDestinoId_fkey" FOREIGN KEY ("divisaDestinoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metodoPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL CHECK(length("codigo") <= 20),
    "descripcion" TEXT NOT NULL CHECK(length("descripcion") <= 100),
    "requiereReferencia" BOOLEAN DEFAULT true
);

-- CreateTable
CREATE TABLE "documentoDeuda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sistemaOrigen" TEXT NOT NULL CHECK(length("sistemaOrigen") <= 50),
    "referenciaOrigen" TEXT NOT NULL CHECK(length("referenciaOrigen") <= 100),
    "identificadorCliente" TEXT NOT NULL CHECK(length("identificadorCliente") <= 100),
    "montoTotalBase" DECIMAL NOT NULL,
    "saldoPendienteBase" DECIMAL NOT NULL,
    "estado" TEXT DEFAULT 'PENDIENTE',
    "tipoDocumento" TEXT DEFAULT 'FACTURA',
    "fechaEmision" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cuentaDestino" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "divisaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    CONSTRAINT "cuentaDestino_divisaId_fkey" FOREIGN KEY ("divisaId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaccionPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentoId" INTEGER NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "divisaPagoId" INTEGER NOT NULL,
    "montoOrigen" DECIMAL NOT NULL,
    "tasaAplicada" DECIMAL NOT NULL,
    "montoEquivalenteBase" DECIMAL NOT NULL,
    "numeroReferencia" TEXT CHECK(length("numeroReferencia") <= 100),
    "estado" TEXT DEFAULT 'APROBADO',
    "tipoOperacion" TEXT DEFAULT 'INGRESO',
    "fechaPago" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "cuentaDestinoId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "transaccionPago_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentoDeuda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodoPago" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_divisaPagoId_fkey" FOREIGN KEY ("divisaPagoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentaDestino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "varianteProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL CHECK(length("sku") <= 50),
    "nombre" TEXT NOT NULL CHECK(length("nombre") <= 100),
    "precioBase" DECIMAL NOT NULL,
    CONSTRAINT "varianteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreUsuario" TEXT NOT NULL CHECK(length("nombreUsuario") <= 50),
    "hashContrasena" TEXT NOT NULL CHECK(length("hashContrasena") <= 255),
    "fechaCreacion" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "chofer_licenciaConducir_key" ON "chofer"("licenciaConducir");

-- CreateIndex
CREATE UNIQUE INDEX "lote_varianteId_numeroLote_key" ON "lote"("varianteId", "numeroLote");

-- CreateIndex
CREATE UNIQUE INDEX "movimientoInventario_detalleOrdenId_loteId_key" ON "movimientoInventario"("detalleOrdenId", "loteId");

-- CreateIndex
CREATE UNIQUE INDEX "ordenDespacho_numeroOrden_key" ON "ordenDespacho"("numeroOrden");

-- CreateIndex
CREATE UNIQUE INDEX "motivoRechazo_codigo_key" ON "motivoRechazo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "divisa_codigo_key" ON "divisa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "metodoPago_codigo_key" ON "metodoPago"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "documentoDeuda_sistemaOrigen_referenciaOrigen_key" ON "documentoDeuda"("sistemaOrigen", "referenciaOrigen");

-- CreateIndex
CREATE UNIQUE INDEX "varianteProducto_sku_key" ON "varianteProducto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_nombreUsuario_key" ON "usuario"("nombreUsuario");
