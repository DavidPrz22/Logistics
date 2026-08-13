-- AlterTable
ALTER TABLE "detalleOrden" ADD COLUMN "precioUnitarioVes" DECIMAL;
ALTER TABLE "detalleOrden" ADD COLUMN "subtotalVes" DECIMAL;

-- AlterTable
ALTER TABLE "documentoDeuda" ADD COLUMN "montoTotalVes" DECIMAL;
ALTER TABLE "documentoDeuda" ADD COLUMN "saldoPendienteVes" DECIMAL;
ALTER TABLE "documentoDeuda" ADD COLUMN "tasaEmisionValor" DECIMAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ordenDespacho" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroOrden" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "choferId" INTEGER,
    "almacenTransitoId" INTEGER NOT NULL,
    "fechaSalida" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT DEFAULT 'PREPARACION',
    "tasaCambioId" INTEGER,
    "tasaCambioValor" DECIMAL,
    "tipoOrden" TEXT NOT NULL,
    "totalOriginal" DECIMAL DEFAULT 0.00,
    "totalOriginalVes" DECIMAL DEFAULT 0.00,
    "totalRechazado" DECIMAL DEFAULT 0.00,
    "montoFacturadoNeto" DECIMAL DEFAULT 0.00,
    "montoFacturadoNetoVes" DECIMAL DEFAULT 0.00,
    "totalAbonado" DECIMAL DEFAULT 0.00,
    "saldoNetoCobrar" DECIMAL DEFAULT 0.00,
    CONSTRAINT "ordenDespacho_tasaCambioId_fkey" FOREIGN KEY ("tasaCambioId") REFERENCES "tasaCambio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "chofer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ordenDespacho_almacenTransitoId_fkey" FOREIGN KEY ("almacenTransitoId") REFERENCES "almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ordenDespacho" ("almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "montoFacturadoNeto", "numeroOrden", "saldoNetoCobrar", "tasaCambioId", "tipoOrden", "totalAbonado", "totalOriginal", "totalRechazado") SELECT "almacenTransitoId", "choferId", "clienteId", "estado", "fechaSalida", "id", "montoFacturadoNeto", "numeroOrden", "saldoNetoCobrar", "tasaCambioId", "tipoOrden", "totalAbonado", "totalOriginal", "totalRechazado" FROM "ordenDespacho";
DROP TABLE "ordenDespacho";
ALTER TABLE "new_ordenDespacho" RENAME TO "ordenDespacho";
CREATE UNIQUE INDEX "ordenDespacho_numeroOrden_key" ON "ordenDespacho"("numeroOrden");
CREATE TABLE "new_transaccionPago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentoId" INTEGER,
    "ordenId" INTEGER,
    "tipoDePago" TEXT NOT NULL,
    "metodoPagoId" INTEGER NOT NULL,
    "divisaPagoId" INTEGER NOT NULL,
    "montoOrigen" DECIMAL NOT NULL,
    "tasaAplicadaId" INTEGER,
    "tasaAplicadaValor" DECIMAL,
    "montoEquivalenteBase" DECIMAL NOT NULL,
    "montoCalculadoVes" DECIMAL,
    "numeroReferencia" TEXT,
    "estado" TEXT DEFAULT 'APROBADO',
    "tipoOperacion" TEXT DEFAULT 'INGRESO',
    "fechaPago" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "cuentaDestinoId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "transaccionPago_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentoDeuda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodoPago" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_divisaPagoId_fkey" FOREIGN KEY ("divisaPagoId") REFERENCES "divisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_tasaAplicadaId_fkey" FOREIGN KEY ("tasaAplicadaId") REFERENCES "tasaCambio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentaDestino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transaccionPago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transaccionPago" ("cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "ordenId", "tasaAplicadaId", "tipoDePago", "tipoOperacion", "usuarioId") SELECT "cuentaDestinoId", "divisaPagoId", "documentoId", "estado", "fechaPago", "id", "metodoPagoId", "montoEquivalenteBase", "montoOrigen", "numeroReferencia", "ordenId", "tasaAplicadaId", "tipoDePago", "tipoOperacion", "usuarioId" FROM "transaccionPago";
DROP TABLE "transaccionPago";
ALTER TABLE "new_transaccionPago" RENAME TO "transaccionPago";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
